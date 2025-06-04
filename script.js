// --- ДАННЫЕ ---
let tiers = [
    { label: 'S', color: '#FF7F7F', images: [], icon: '' },
    { label: 'A', color: '#FFBF7F', images: [], icon: '' },
    { label: 'B', color: '#FFDF7F', images: [], icon: '' },
    { label: 'C', color: '#FFFF7F', images: [], icon: '' },
    { label: 'D', color: '#BFFF7F', images: [], icon: '' }
];
let imageBank = [];
let draggedImg = null;
let draggedFromTier = null;
let draggedFromBank = false;
let draggedFromIndex = null;

function updateImageCounter() {
    // Считаем общее количество картинок
    let totalImages = imageBank.length;
    tiers.forEach(tier => {
      totalImages += tier.images.length;
    });
    
    // Обновляем отображение
    const counter = document.getElementById('image-counter');
    if (counter) {
      counter.textContent = `(${totalImages})`;
    }
  }
  

// --- СОРТИРОВКА ---
function sortTiers() {
    tiers.sort((a, b) => a.label.localeCompare(b.label, 'ru', {sensitivity: 'base'}));
}

// --- ОТРИСОВКА ТИРЛИСТА ---
function renderTierlist() {
    // sortTiers();
    const container = document.getElementById('tierlist');
    container.innerHTML = '';
    tiers.forEach((tier, idx) => {
    const row = document.createElement('div');
    row.className = 'tier-row';

    // Метка уровня с иконкой
    const label = document.createElement('div');
    label.className = 'label-holder';
    label.style.background = tier.color;
    if (tier.icon) {
        const icon = document.createElement('img');
        icon.className = 'label-icon';
        icon.src = tier.icon;
        icon.alt = '';
        label.appendChild(icon);
    }
    const span = document.createElement('span');
    span.innerText = tier.label;
    label.appendChild(span);
    row.appendChild(label);

    // Картинки
    const tierDiv = document.createElement('div');
    tierDiv.className = 'tier';
    tierDiv.ondragover = e => e.preventDefault();
    tierDiv.ondrop = e => {
        e.preventDefault();
        if (draggedImg) {
        if (draggedFromBank) {
            // Из банка в уровень
            const bankIdx = imageBank.indexOf(draggedImg);
            if (bankIdx !== -1) imageBank.splice(bankIdx, 1);
            tier.images.push(draggedImg);
            renderTierlist();
        } else if (draggedFromTier !== null) {
            // Улучшенная логика для многострочного drag and drop
            const fromIdx = tiers[draggedFromTier].images.indexOf(draggedImg);
            if (fromIdx !== -1) {
            tiers[draggedFromTier].images.splice(fromIdx, 1);
            
            // Находим ближайшую картинку по расстоянию
            const images = Array.from(tierDiv.querySelectorAll('.character'));
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            
            let closestImage = null;
            let closestDistance = Infinity;
            let insertIndex = tier.images.length; // По умолчанию в конец
            
            images.forEach((img, imgIdx) => {
                const rect = img.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const dx = mouseX - centerX;
                const dy = mouseY - centerY;
                const distance = dx * dx + dy * dy;
                
                if (distance < closestDistance) {
                closestDistance = distance;
                closestImage = img;
                
                // Определяем, вставлять до или после найденной картинки
                if (mouseX < centerX) {
                    insertIndex = imgIdx; // Вставить перед
                } else {
                    insertIndex = imgIdx + 1; // Вставить после
                }
                }
            });
            
            // Если не нашли близкую картинку или мышь справа от всех картинок
            if (!closestImage || mouseX > tierDiv.getBoundingClientRect().right - 50) {
                insertIndex = tier.images.length;
            }
            
            // Вставляем картинку в нужную позицию
            if (draggedFromTier === idx) {
                // Внутри того же уровня - изменение порядка
                tier.images.splice(Math.min(insertIndex, tier.images.length), 0, draggedImg);
            } else {
                // Между разными уровнями
                tier.images.splice(Math.min(insertIndex, tier.images.length), 0, draggedImg);
            }
            renderTierlist();
            }
        }
        }
    };

    tier.images.forEach((img, imgIdx) => {
        const imgDiv = document.createElement('div');
        imgDiv.className = 'character';
        imgDiv.style.backgroundImage = `url('${img}')`;
        imgDiv.draggable = true;
        imgDiv.ondragstart = () => {
        imgDiv.classList.add('dragging');
        draggedImg = img;
        draggedFromTier = idx;
        draggedFromBank = false;
        draggedFromIndex = imgIdx;
        };
        imgDiv.ondragend = () => {
        imgDiv.classList.remove('dragging');
        draggedImg = null;
        draggedFromTier = null;
        draggedFromBank = false;
        draggedFromIndex = null;
        };
        
        // Обработчик клика по мусорке
        imgDiv.addEventListener('click', (e) => {
        const rect = imgDiv.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        
        // Если клик в области мусорки (правый верхний угол)
        if (clickX > 62 && clickY < 34) {
            tier.images = tier.images.filter(i => i !== img);
            renderTierlist();
        }
        });
        tierDiv.appendChild(imgDiv);
    });
    row.appendChild(tierDiv);
    container.appendChild(row);
    });
    renderImageBank();
    updateImageCounter();
}

// --- БАНК КАРТИНОК ---
function renderImageBank() {
    const bank = document.getElementById('image-bank');
    bank.innerHTML = '';
    
    // Добавляем обработчики для возврата картинок в банк
    bank.ondragover = e => {
    e.preventDefault();
    bank.classList.add('drop-zone');
    };
    bank.ondragleave = e => {
    if (!bank.contains(e.relatedTarget)) {
        bank.classList.remove('drop-zone');
    }
    };
    bank.ondrop = e => {
    e.preventDefault();
    bank.classList.remove('drop-zone');
    
    if (draggedImg && !draggedFromBank) {
        // Возвращаем картинку из уровня в банк
        if (draggedFromTier !== null) {
        const fromIdx = tiers[draggedFromTier].images.indexOf(draggedImg);
        if (fromIdx !== -1) {
            tiers[draggedFromTier].images.splice(fromIdx, 1);
            imageBank.push(draggedImg);
            renderTierlist();
        }
        }
    }
    };

    imageBank.forEach((img, idx) => {
    const imgDiv = document.createElement('div');
    imgDiv.className = 'image-bank-img';
    imgDiv.style.backgroundImage = `url('${img}')`;
    imgDiv.draggable = true;
    imgDiv.ondragstart = () => {
        imgDiv.classList.add('dragging');
        draggedImg = img;
        draggedFromTier = null;
        draggedFromBank = true;
    };
    imgDiv.ondragend = () => {
        imgDiv.classList.remove('dragging');
        draggedImg = null;
        draggedFromTier = null;
        draggedFromBank = false;
    };
    
    // Обработчик клика по мусорке в банке
    imgDiv.addEventListener('click', (e) => {
        const rect = imgDiv.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        
        // Если клик в области мусорки (правый верхний угол)
        if (clickX > 62 && clickY < 34) {
        imageBank.splice(idx, 1);
        renderImageBank();
        }
    });
    
    bank.appendChild(imgDiv);
    });
    updateImageCounter();
}

// --- ЗАГРУЗКА КАРТИНОК ---
document.getElementById('upload').addEventListener('change', function(e) {
    const files = Array.from(e.target.files);
    files.forEach(file => {
    const reader = new FileReader();
    reader.onload = function(ev) {
        imageBank.push(ev.target.result);
        renderImageBank();
        updateImageCounter();
    };
    reader.readAsDataURL(file);
    });
    e.target.value = '';
});

function closeEditModal() {
    document.getElementById('modal-root').innerHTML = '';
}

function openEditModal() {
    const modalRoot = document.getElementById('modal-root');
    modalRoot.innerHTML = `
    <div class="modal-bg" onclick="if(event.target===this)closeEditModal()">
        <div class="modal">
        <div class="modal-header">
            <h2>Управление уровнями</h2>
            <button class="close-modal" onclick="closeEditModal()">&times;</button>
        </div>
        <div class="modal-body">
            <div class="tier-edit-container" id="tiers-edit-list"></div>
            <button class="add-tier-btn" onclick="addTierRowModal()">
            + Добавить
            </button>
        </div>
        <div class="modal-footer">
            <div class="modal-actions-split">
            <button class="btn btn--cancel" onclick="closeEditModal()">Отмена</button>
            <button class="btn btn--save" onclick="saveTiersModal()">Сохранить</button>
            </div>
        </div>
        </div>
    </div>
    `;
    renderTiersEditList();
}


function renderTiersEditList() {
    const editList = document.getElementById('tiers-edit-list');
    editList.innerHTML = '';
    
    tiers.forEach((tier, idx) => {
    const tierItem = document.createElement('div');
    tierItem.className = 'tier-edit-item';
    tierItem.dataset.index = idx;
    tierItem.style.animationDelay = `${idx * 0.05}s`;
    
    tierItem.innerHTML = `
        <div class="arrow-controls">
        <button class="arrow-btn" 
                onclick="moveTierUp(${idx})" 
                title="Переместить вверх"
                ${idx === 0 ? 'disabled' : ''}>
            <i class="fi fi-rr-angle-small-up"></i>
        </button>
        <button class="arrow-btn" 
                onclick="moveTierDown(${idx})" 
                title="Переместить вниз"
                ${idx === tiers.length - 1 ? 'disabled' : ''}>
            <i class="fi fi-rr-angle-small-down"></i>
        </button>
        </div>
        
        <div class="tier-preview" style="background: ${tier.color}">
        ${tier.icon ? `<img src="${tier.icon}" class="tier-icon-preview" alt="">` : ''}
        <span>${tier.label}</span>
        </div>
        
        <div class="tier-controls">
        <div class="tier-input-group">
            <input type="text" 
                class="tier-name-input" 
                value="${tier.label.replace(/"/g, '&quot;')}" 
                maxlength="3" 
                data-idx="${idx}"
                placeholder="ABC">
        </div>
        
        <div class="tier-input-group">
            <input type="color" 
                class="tier-color-input" 
                value="${tier.color}" 
                data-idx="${idx}"
                title="Выбрать цвет">
        </div>
        </div>
        
        <div class="tier-actions">
        <button class="action-btn action-btn--delete" 
                onclick="deleteTierRowModal(${idx})" 
                title="Удалить уровень">
            <i class="fi fi-sr-trash"></i>
        </button>
        
        <input type="file" 
                class="icon-upload-input" 
                id="icon-upload-${idx}" 
                accept="image/*" 
                data-idx="${idx}">
        </div>
    `;
    
    editList.appendChild(tierItem);
    
    // Обработчики событий для полей ввода
    const nameInput = tierItem.querySelector('.tier-name-input');
    const colorInput = tierItem.querySelector('.tier-color-input');
    const iconInput = tierItem.querySelector('.icon-upload-input');
    
    nameInput.oninput = (e) => {
        const newLabel = e.target.value.slice(0, 3);
        tiers[idx].label = newLabel;
        tierItem.querySelector('.tier-preview span').textContent = newLabel;
    };
    
    colorInput.oninput = (e) => {
        const newColor = e.target.value;
        tiers[idx].color = newColor;
        tierItem.querySelector('.tier-preview').style.background = newColor;
    };
    
    iconInput.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(ev) {
        tiers[idx].icon = ev.target.result;
        
        // Обновляем превью
        const preview = tierItem.querySelector('.tier-preview');
        let iconImg = preview.querySelector('.tier-icon-preview');
        
        if (!iconImg) {
            iconImg = document.createElement('img');
            iconImg.className = 'tier-icon-preview';
            preview.insertBefore(iconImg, preview.querySelector('span'));
        }
        
        iconImg.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    };
    });
}

function moveTierUp(idx) {
    if (idx > 0) {
    // Меняем местами элементы в массиве
    const temp = tiers[idx];
    tiers[idx] = tiers[idx - 1];
    tiers[idx - 1] = temp;
    
    // Перерисовываем список
    renderTiersEditList();
    }
}

function moveTierDown(idx) {
    if (idx < tiers.length - 1) {
    // Меняем местами элементы в массиве
    const temp = tiers[idx];
    tiers[idx] = tiers[idx + 1];
    tiers[idx + 1] = temp;
    
    // Перерисовываем список
    renderTiersEditList();
    }
}

function triggerIconUpload(idx) {
    document.getElementById(`icon-upload-${idx}`).click();
}


function triggerIconUpload(idx) {
    document.getElementById(`icon-upload-${idx}`).click();
}


function addTierRowModal() {
    tiers.push({ label: 'NEW', color: '#7FBFFF', images: [], icon: '' });
    renderTiersEditList();
}

function deleteTierRowModal(idx) {
    if (tiers.length > 1) {
    tiers.splice(idx, 1);
    renderTiersEditList();
    }
}

function saveTiersModal() {
    // sortTiers();
    closeEditModal();
    renderTierlist();
}

// --- ФУНКЦИИ УПРАВЛЕНИЯ ---
function resetTierlist() {
    // Собираем все картинки из всех уровней
    tiers.forEach(tier => {
    // Добавляем все картинки из уровня в банк
    imageBank.push(...tier.images);
    // Очищаем уровень
    tier.images = [];
    });
    renderTierlist();
}
// --- ИНИЦИАЛИЗАЦИЯ ---
renderTierlist();
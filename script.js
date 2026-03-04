const translations = {
  en: {
    hero: "How much should I feed my cat?",
    weightLabel: "Cat Weight (kg)",
    typeLabel: "Cat Type",
    productLabel: "Select food product",
    foodLabel: "Food Energy (kcal/kg)",
    disclaimer: "This calculator provides an estimate based on the 2021 AAHA Nutrition and Weight Management Guidelines for Dogs and Cats. Always consult your veterinarian.",
    fillFields: "Please fill in all fields.",
    kcalDay: "kcal/day",
    gramsDay: "grams/day",
    selectFood: "-- Select food --",
    customFood: "Custom",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    english: "English",
    portuguese: "PT-BR"
  },
  pt: {
    hero: "Quanto devo alimentar meu gato?",
    weightLabel: "Peso do gato (kg)",
    typeLabel: "Tipo de gato",
    productLabel: "Selecionar alimento",
    foodLabel: "Energia do alimento (kcal/kg)",
    disclaimer: "Esta calculadora fornece uma estimativa com base nas diretrizes do 2021 AAHA Nutrition and Weight Management Guidelines for Dogs and Cats. Consulte sempre seu veterinário.",
    fillFields: "Por favor, preencha todos os campos.",
    kcalDay: "kcal/dia",
    gramsDay: "gramas/dia",
    selectFood: "-- Escolher alimento --",
    customFood: "Personalizado",
    darkMode: "Modo Escuro",
    lightMode: "Modo Claro",
    english: "Inglês",
    portuguese: "Português"
  }
};

let currentLang = localStorage.getItem("lang") || "pt";

const weightInput = document.getElementById("weight");
const weightRange = document.getElementById("weightRange");
const typeSelect = document.getElementById("type");
const foodSelect = document.getElementById("foodSelect");
const foodEnergyInput = document.getElementById("foodEnergy");
const foodRange = document.getElementById("foodRange");
const resultDiv = document.getElementById("result");
const langToggle = document.getElementById("langToggle");
const darkToggle = document.getElementById("darkToggle");

function applyLanguage() {
  const t = translations[currentLang];

  document.getElementById("hero").innerText = t.hero;
  document.getElementById("weightLabel").innerText = t.weightLabel;
  document.getElementById("typeLabel").innerText = t.typeLabel;
  document.getElementById("productLabel").innerText = t.productLabel;
  document.getElementById("foodLabel").innerText = t.foodLabel;
  document.getElementById("disclaimer").innerText = t.disclaimer;

  weightInput.placeholder = currentLang === "en" ? "e.g. 4.5" : "ex: 4,5";

  // Update cat type options
  document.querySelectorAll("#type option").forEach(opt => {
    opt.textContent = opt.getAttribute(`data-${currentLang}`);
  });

  // Rebuild food list BUT preserve selection
  populateFoodList();
}

function populateFoodList() {
  const t = translations[currentLang];

  const selectedId = foodSelect.value;

  foodSelect.innerHTML = "";

  // Default option
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = t.selectFood;
  foodSelect.appendChild(defaultOption);

  // Custom option
  const customOption = document.createElement("option");
  customOption.value = "custom";
  customOption.textContent = t.customFood;
  foodSelect.appendChild(customOption);

  // Food products
  foods.forEach(food => {
    const option = document.createElement("option");
    option.value = food.id;
    option.textContent = `${food.brand[currentLang]} - ${food.name[currentLang]}`;
    foodSelect.appendChild(option);
  });

  if (selectedId) {
    foodSelect.value = selectedId;
  }
}

function recalculate() {
  const t = translations[currentLang];

  let weight = parseFloat(weightInput.value.replace(',', '.'));
  let multiplier = parseFloat(typeSelect.value);
  let foodEnergy = parseFloat(foodEnergyInput.value);

  if (isNaN(weight) || weight <= 0 || isNaN(foodEnergy) || foodEnergy <= 0) {
    resultDiv.innerHTML = t.fillFields;
    return;
  }

  const RER = 70 * Math.pow(weight, 0.75);
  const calories = RER * multiplier;
  const grams = (calories / foodEnergy) * 1000;

  resultDiv.innerHTML = `
    <strong>${calories.toFixed(0)} ${t.kcalDay}</strong><br>
    ≈ <strong>${grams.toFixed(0)} ${t.gramsDay}</strong>
  `;
}

foodSelect.addEventListener("change", function() {

  if (this.value === "custom" || this.value === "") {
    // document.getElementById("foodImageContainer").innerHTML = ""; // IMPLEMENT IMAGE LATER
    localStorage.removeItem("lastFood");
    return;
  }

  const selectedFood = foods.find(f => f.id == this.value);
  if (!selectedFood) return;

  foodEnergyInput.value = selectedFood.energy;
  foodRange.value = selectedFood.energy;

  localStorage.setItem("lastFood", selectedFood.id);

//   document.getElementById("foodImageContainer").innerHTML =
//     `<img src="${selectedFood.image}" style="width:120px;margin-top:10px;border-radius:12px;">`; // IMPLEMENT IMAGE LATER

  recalculate();
});

weightInput.addEventListener("input", () => {
  weightRange.value = weightInput.value;
  recalculate();
});

weightRange.addEventListener("input", () => {
  weightInput.value = weightRange.value;
  recalculate();
});

// detect manual change

function setCustomFoodIfManualChange() {
  if (foodSelect.value !== "custom") {
    foodSelect.value = "custom";
    localStorage.removeItem("lastFood");
  }
};

foodEnergyInput.addEventListener("input", () => {
  foodRange.value = foodEnergyInput.value;
  setCustomFoodIfManualChange();
  recalculate();
});

foodRange.addEventListener("input", () => {
  foodEnergyInput.value = foodRange.value;
  setCustomFoodIfManualChange();
  recalculate();
});

typeSelect.addEventListener("change", recalculate);

langToggle.addEventListener("change", function() {
  currentLang = this.checked ? "en" : "pt";
  localStorage.setItem("lang", currentLang);
  applyLanguage();
  updateToggleLabels();
  recalculate();
});

/* ✅ DARK MODE FIX */
darkToggle.addEventListener("change", function() {
  document.body.classList.toggle("dark", this.checked);
  localStorage.setItem("darkMode", this.checked);
  updateToggleLabels();
});

// smart toggle label function

function updateToggleLabels() {
  const t = translations[currentLang];

  // Dark Mode Label
  if (darkToggle.checked) {
    darkModeLabel.innerText = t.lightMode;
  } else {
    darkModeLabel.innerText = t.darkMode;
  }

  // Language Label
  if (langToggle.checked) {
    langLabel.innerText = t.portuguese;
  } else {
    langLabel.innerText = t.english;
  }
};

window.onload = function() {
  /* Restore Dark Mode */
  const savedDark = localStorage.getItem("darkMode") === "true";
  darkToggle.checked = savedDark;
  document.body.classList.toggle("dark", savedDark);

  /* Restore Language */
  langToggle.checked = currentLang === "en";
  applyLanguage();

  /* Restore Selected Food */
  const savedFood = localStorage.getItem("lastFood");
  if (savedFood) {
    foodSelect.value = savedFood;
    foodSelect.dispatchEvent(new Event("change"));
  }

  recalculate();

  updateToggleLabels();
};
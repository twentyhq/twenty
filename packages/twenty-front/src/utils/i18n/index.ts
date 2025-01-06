import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enLang from "./translations/en.json";
import ptLang from "./translations/pt.json";

const resources = {
  en: {
    translation: enLang,
  },
  pt: {
    translation: ptLang,
  }
};

i18n
  .use(initReactI18next) 
  .init({
    resources,
    fallbackLng: 'pt',
    lng: localStorage.getItem('language') || "en",
    interpolation: {
      escapeValue: false 
    }
  });

  export default i18n;
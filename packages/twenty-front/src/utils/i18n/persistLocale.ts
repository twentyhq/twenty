import { type APP_LOCALES } from 'twenty-shared/translations';

export const LOCALE_LOCAL_STORAGE_KEY = 'locale';

// Read back by initialI18nActivate, so the next load starts in this locale
export const persistLocale = (locale: keyof typeof APP_LOCALES) => {
  try {
    localStorage.setItem(LOCALE_LOCAL_STORAGE_KEY, locale);
  } catch {
    // noop
  }
};

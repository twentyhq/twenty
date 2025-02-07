import { i18n } from '@lingui/core';
import { APP_LOCALES } from 'twenty-shared';

export const dynamicActivate = async (locale: keyof typeof APP_LOCALES) => {
  const { messages } = await import(`../../locales/generated/${locale}.ts`);
  i18n.load(locale, messages);
  i18n.activate(locale);
  try {
    localStorage.setItem('locale', locale);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('Failed to save locale to localStorage:', error);
  }
};

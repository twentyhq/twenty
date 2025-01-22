import { i18n } from '@lingui/core';

export const loadAndActivateLocale = async (locale: string) => {
  try {
    const { messages } = await import(`../locales/${locale}/messages`);
    i18n.load(locale, messages);
    i18n.activate(locale);
  } catch (error) {
    throw new Error(`Could not load locale: ${locale}`);
  }
};

import { i18n } from '@lingui/core';
import { APP_LOCALES } from 'twenty-shared';

export const dynamicActivate = async (locale: keyof typeof APP_LOCALES) => {
  const { messages } = await import(`../../locales/generated/${locale}.ts`);
  i18n.load(locale, messages);
  i18n.activate(locale);
};

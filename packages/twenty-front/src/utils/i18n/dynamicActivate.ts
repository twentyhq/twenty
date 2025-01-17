import { i18n } from '@lingui/core';

export const dynamicActivate = async (locale: string) => {
  const { messages } = await import(`../../locales/generated/${locale}.ts`);
  i18n.load(locale, messages);
  i18n.activate(locale);
};

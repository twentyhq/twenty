import { i18n } from '@lingui/core';
import { APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';

import { applyDocumentLocaleDirection } from '~/utils/i18n/applyDocumentLocaleDirection';

export const dynamicActivate = async (locale: keyof typeof APP_LOCALES) => {
  if (!Object.values(APP_LOCALES).includes(locale)) {
    // oxlint-disable-next-line no-console
    console.warn(`Invalid locale "${locale}", defaulting to "en"`);
    locale = SOURCE_LOCALE;
  }
  applyDocumentLocaleDirection(locale);
  const { messages } = await import(`../../locales/generated/${locale}.ts`);
  i18n.load(locale, messages);
  i18n.activate(locale);
};

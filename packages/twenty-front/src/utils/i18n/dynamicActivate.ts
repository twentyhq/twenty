import { i18n } from '@lingui/core';
import {
  APP_LOCALES,
  getLocaleTextDirection,
  SOURCE_LOCALE,
} from 'twenty-shared/translations';

let latestRequestedLocale: keyof typeof APP_LOCALES | undefined;

const applyDocumentLocale = (locale: keyof typeof APP_LOCALES) => {
  document.documentElement.lang = locale;
  document.documentElement.dir = getLocaleTextDirection(locale);
};

export const dynamicActivate = async (locale: keyof typeof APP_LOCALES) => {
  if (!Object.values(APP_LOCALES).includes(locale)) {
    // oxlint-disable-next-line no-console
    console.warn(`Invalid locale "${locale}", defaulting to "en"`);
    locale = SOURCE_LOCALE;
  }

  latestRequestedLocale = locale;

  // load() and activate() always emit "change", which hands every useLingui consumer a new t
  if (i18n.locale === locale) {
    applyDocumentLocale(locale);
    return;
  }

  const { messages } = await import(`../../locales/generated/${locale}.ts`);

  if (latestRequestedLocale !== locale) {
    return;
  }

  if (i18n.locale === locale) {
    applyDocumentLocale(locale);
    return;
  }

  i18n.load(locale, messages);
  i18n.activate(locale);
  applyDocumentLocale(locale);
};

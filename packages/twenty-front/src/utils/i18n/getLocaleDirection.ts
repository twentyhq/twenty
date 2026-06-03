import { REACT_APP_SHAHRYAR_MODE } from '~/config';

export type LocaleDirection = 'ltr' | 'rtl';

const RTL_LANGUAGE_CODES = new Set(['ar', 'ckb', 'fa', 'he', 'iw', 'ur']);
const RTL_LOCALES = new Set(['ckb-IQ', 'ku-Arab']);

export const getLocaleDirection = (locale?: string): LocaleDirection => {
  if (REACT_APP_SHAHRYAR_MODE) {
    return 'rtl';
  }

  if (locale === undefined) {
    return 'ltr';
  }

  const normalizedLocale = locale.trim();
  const languageCode = normalizedLocale.split(/[-_]/)[0]?.toLowerCase();

  return RTL_LOCALES.has(normalizedLocale) ||
    (languageCode !== undefined && RTL_LANGUAGE_CODES.has(languageCode))
    ? 'rtl'
    : 'ltr';
};

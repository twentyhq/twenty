import { type APP_LOCALES } from 'twenty-shared/translations';

type AppLocale = keyof typeof APP_LOCALES;
export const getDateFnsLocaleImport = (locale: AppLocale) => {
  switch (locale) {
    case 'af-ZA':
      return import('date-fns/locale/af');
    case 'ar-SA':
      return import('date-fns/locale/ar');
    case 'ca-ES':
      return import('date-fns/locale/ca');
    case 'cs-CZ':
      return import('date-fns/locale/cs');
    case 'da-DK':
      return import('date-fns/locale/da');
    case 'de-DE':
      return import('date-fns/locale/de');
    case 'el-GR':
      return import('date-fns/locale/el');
    case 'en':
    case 'pseudo-en':
      return import('date-fns/locale/en-US');
    case 'es-ES':
      return import('date-fns/locale/es');
    case 'fi-FI':
      return import('date-fns/locale/fi');
    case 'fr-FR':
      return import('date-fns/locale/fr');
    case 'he-IL':
      return import('date-fns/locale/he');
    case 'hu-HU':
      return import('date-fns/locale/hu');
    case 'it-IT':
      return import('date-fns/locale/it');
    case 'ja-JP':
      return import('date-fns/locale/ja');
    case 'ko-KR':
      return import('date-fns/locale/ko');
    case 'nl-NL':
      return import('date-fns/locale/nl');
    case 'no-NO':
      return import('date-fns/locale/nb');
    case 'pl-PL':
      return import('date-fns/locale/pl');
    case 'pt-BR':
    case 'pt-PT':
      return import('date-fns/locale/pt');
    case 'ro-RO':
      return import('date-fns/locale/ro');
    case 'ru-RU':
      return import('date-fns/locale/ru');
    case 'sr-Cyrl':
      return import('date-fns/locale/sr');
    case 'sv-SE':
      return import('date-fns/locale/sv');
    case 'tr-TR':
      return import('date-fns/locale/tr');
    case 'uk-UA':
      return import('date-fns/locale/uk');
    case 'vi-VN':
      return import('date-fns/locale/vi');
    case 'zh-CN':
      return import('date-fns/locale/zh-CN');
    case 'zh-TW':
      return import('date-fns/locale/zh-TW');
    default: {
      return import('date-fns/locale/en-US');
    }
  }
};

export const getDateFnsLocale = async (localeString?: string | null) => {
  return getDateFnsLocaleImport(localeString as AppLocale)
    .then((m) => m.default as unknown as Locale)
    .catch((_e) => undefined);
};

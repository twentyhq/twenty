import { APP_LOCALES } from 'twenty-shared/translations';

type AppLocale = keyof typeof APP_LOCALES;
export const getDateFnsLocaleImport = (locale: AppLocale) => {
  switch (locale) {
    case 'af-ZA':
      return /* webpackMode: "lazy", webpackChunkName: "af" */ import(
        'date-fns/locale/af'
      );
    case 'ar-SA':
      return /* webpackMode: "lazy", webpackChunkName: "ar" */ import(
        'date-fns/locale/ar'
      );
    case 'ca-ES':
      return /* webpackMode: "lazy", webpackChunkName: "ca" */ import(
        'date-fns/locale/ca'
      );
    case 'cs-CZ':
      return /* webpackMode: "lazy", webpackChunkName: "cs" */ import(
        'date-fns/locale/cs'
      );
    case 'da-DK':
      return /* webpackMode: "lazy", webpackChunkName: "da" */ import(
        'date-fns/locale/da'
      );
    case 'de-DE':
      return /* webpackMode: "lazy", webpackChunkName: "de" */ import(
        'date-fns/locale/de'
      );
    case 'el-GR':
      return /* webpackMode: "lazy", webpackChunkName: "el" */ import(
        'date-fns/locale/el'
      );
    case 'en':
    case 'pseudo-en':
      return /* webpackMode: "lazy", webpackChunkName: "en-US" */ import(
        'date-fns/locale/en-US'
      );
    case 'es-ES':
      return /* webpackMode: "lazy", webpackChunkName: "es" */ import(
        'date-fns/locale/es'
      );
    case 'fi-FI':
      return /* webpackMode: "lazy", webpackChunkName: "fi" */ import(
        'date-fns/locale/fi'
      );
    case 'fr-FR':
      return /* webpackMode: "lazy", webpackChunkName: "fr" */ import(
        'date-fns/locale/fr'
      );
    case 'he-IL':
      return /* webpackMode: "lazy", webpackChunkName: "he" */ import(
        'date-fns/locale/he'
      );
    case 'hu-HU':
      return /* webpackMode: "lazy", webpackChunkName: "hu" */ import(
        'date-fns/locale/hu'
      );
    case 'it-IT':
      return /* webpackMode: "lazy", webpackChunkName: "it" */ import(
        'date-fns/locale/it'
      );
    case 'ja-JP':
      return /* webpackMode: "lazy", webpackChunkName: "ja" */ import(
        'date-fns/locale/ja'
      );
    case 'ko-KR':
      return /* webpackMode: "lazy", webpackChunkName: "ko" */ import(
        'date-fns/locale/ko'
      );
    case 'nl-NL':
      return /* webpackMode: "lazy", webpackChunkName: "nl" */ import(
        'date-fns/locale/nl'
      );
    case 'no-NO':
      return /* webpackMode: "lazy", webpackChunkName: "nb" */ import(
        'date-fns/locale/nb'
      );
    case 'pl-PL':
      return /* webpackMode: "lazy", webpackChunkName: "pl" */ import(
        'date-fns/locale/pl'
      );
    case 'pt-BR':
    case 'pt-PT':
      return /* webpackMode: "lazy", webpackChunkName: "pt" */ import(
        'date-fns/locale/pt'
      );
    case 'ro-RO':
      return /* webpackMode: "lazy", webpackChunkName: "ro" */ import(
        'date-fns/locale/ro'
      );
    case 'ru-RU':
      return /* webpackMode: "lazy", webpackChunkName: "ru" */ import(
        'date-fns/locale/ru'
      );
    case 'sr-Cyrl':
      return /* webpackMode: "lazy", webpackChunkName: "sr" */ import(
        'date-fns/locale/sr'
      );
    case 'sv-SE':
      return /* webpackMode: "lazy", webpackChunkName: "sv" */ import(
        'date-fns/locale/sv'
      );
    case 'tr-TR':
      return /* webpackMode: "lazy", webpackChunkName: "tr" */ import(
        'date-fns/locale/tr'
      );
    case 'uk-UA':
      return /* webpackMode: "lazy", webpackChunkName: "uk" */ import(
        'date-fns/locale/uk'
      );
    case 'vi-VN':
      return /* webpackMode: "lazy", webpackChunkName: "vi" */ import(
        'date-fns/locale/vi'
      );
    case 'zh-CN':
      return /* webpackMode: "lazy", webpackChunkName: "zh-CN" */ import(
        'date-fns/locale/zh-CN'
      );
    case 'zh-TW':
      return /* webpackMode: "lazy", webpackChunkName: "zh-TW" */ import(
        'date-fns/locale/zh-TW'
      );
    default: {
      const _exhaustiveCheck: never = locale;
      return /* webpackMode: "lazy", webpackChunkName: "en-US" */ import(
        'date-fns/locale/en-US'
      );
    }
  }
};

export const getDateFnsLocale = async (localeString?: string | null) => {
  return getDateFnsLocaleImport(localeString as AppLocale)
    .then((m) => m.default as unknown as Locale)
    .catch((_e) => undefined);
};

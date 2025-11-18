export const DEFAULT_LANGUAGE = 'en' as const;

export const SUPPORTED_LANGUAGES = [
  DEFAULT_LANGUAGE,
  'fr',
  'ar',
  'cs',
  'de',
  'es',
  'it',
  'ja',
  'ko',
  'pt',
  'ro',
  'ru',
  'tr',
  'zh',
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];


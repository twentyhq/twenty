import { type AppLocale } from 'twenty-shared/translations';

// locale -> catalog key -> translated string
export type TranslationCatalogsByLocale = Partial<
  Record<AppLocale, Record<string, string>>
>;

import { FRONT_COMPONENT_TRANSLATIONS_KEY } from '../constants/front-component-translations-key';
import { type TranslationCatalogsByLocale } from './message';

export const getFrontComponentTranslations =
  (): TranslationCatalogsByLocale =>
    ((globalThis as Record<string, unknown>)[
      FRONT_COMPONENT_TRANSLATIONS_KEY
    ] as TranslationCatalogsByLocale | undefined) ?? {};

export const setFrontComponentTranslations = (
  catalogs: TranslationCatalogsByLocale,
): void => {
  (globalThis as Record<string, unknown>)[FRONT_COMPONENT_TRANSLATIONS_KEY] =
    catalogs;
};

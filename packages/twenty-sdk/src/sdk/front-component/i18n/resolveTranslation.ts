import { getFrontComponentTranslations } from './front-component-translations';
import {
  getTranslationCatalogKey,
  interpolateMessage,
  normalizeMessageDescriptor,
  type MessageDescriptor,
  type TranslationValues,
} from './message';

// Resolves a message against the baked catalog for the given locale, falling
// back to the source message when no translation exists, then interpolates any
// {placeholder} values. This is the single lookup both t() and <Trans> use.
export const resolveTranslation = (
  descriptor: string | MessageDescriptor,
  values: TranslationValues | undefined,
  locale: string,
): string => {
  const { message, context } = normalizeMessageDescriptor(descriptor);

  const catalog = getFrontComponentTranslations()[locale];
  const translation = catalog?.[getTranslationCatalogKey(message, context)];

  return interpolateMessage(translation ?? message, values);
};

import { type AppLocale } from 'twenty-shared/translations';

import { getFrontComponentTranslations } from './front-component-translations';
import {
  getTranslationCatalogKey,
  interpolateMessage,
  normalizeMessageDescriptor,
  type MessageDescriptor,
  type TranslationValues,
} from './message';

export const resolveTranslation = (
  descriptor: string | MessageDescriptor,
  values: TranslationValues | undefined,
  locale: AppLocale,
): string => {
  const { message, context } = normalizeMessageDescriptor(descriptor);

  const catalog = getFrontComponentTranslations()[locale];
  const translation = catalog?.[getTranslationCatalogKey(message, context)];

  return interpolateMessage(translation ?? message, values);
};

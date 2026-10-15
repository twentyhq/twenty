import {
  generateMessageId,
  interpolateMessagePlaceholders,
} from 'twenty-shared/i18n';
import { type AppLocale } from 'twenty-shared/translations';

import { getFrontComponentTranslations } from './front-component-translations';
import {
  normalizeMessageDescriptor,
  type MessageDescriptor,
  type TranslationValues,
} from './message';

export const resolveTranslation = ({
  descriptor,
  values,
  locale,
  catalog = getFrontComponentTranslations()[locale],
}: {
  descriptor: string | MessageDescriptor;
  values?: TranslationValues;
  locale: AppLocale;
  catalog?: Record<string, string>;
}): string => {
  const { message, context } = normalizeMessageDescriptor(descriptor);

  const translation = catalog?.[generateMessageId(message, context)];

  return interpolateMessagePlaceholders(translation ?? message, values);
};

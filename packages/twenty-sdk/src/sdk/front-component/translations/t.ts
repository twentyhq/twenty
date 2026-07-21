import { SOURCE_LOCALE, type AppLocale } from 'twenty-shared/translations';

import { getFrontComponentExecutionContext } from '../context/frontComponentContext';
import { type FrontComponentExecutionContext } from '../types/FrontComponentExecutionContext';
import { type MessageDescriptor, type TranslationValues } from './message';
import { resolveTranslation } from './resolveTranslation';

const getCurrentLocale = (): AppLocale => {
  // Unset at module scope before the host pushes it.
  const context: FrontComponentExecutionContext | undefined =
    getFrontComponentExecutionContext();

  return context?.locale ?? SOURCE_LOCALE;
};

export const t = (
  descriptor: string | MessageDescriptor,
  values?: TranslationValues,
): string => resolveTranslation(descriptor, values, getCurrentLocale());

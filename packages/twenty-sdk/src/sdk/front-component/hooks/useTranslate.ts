import { useCallback } from 'react';
import { type AppLocale } from 'twenty-shared/translations';

import {
  type MessageDescriptor,
  type TranslationValues,
} from '../translations/message';
import { resolveTranslation } from '../translations/resolveTranslation';
import { useLocale } from './useLocale';

export type UseTranslateResult = {
  locale: AppLocale;
  t: (
    descriptor: string | MessageDescriptor,
    values?: TranslationValues,
  ) => string;
};

// Reactive in-component translation. The returned t() is bound to the current
// locale and changes identity when the locale changes, so components re-render
// with the new language. Use this over the eager t() inside render.
export const useTranslate = (): UseTranslateResult => {
  const locale = useLocale();

  const t = useCallback(
    (descriptor: string | MessageDescriptor, values?: TranslationValues) =>
      resolveTranslation(descriptor, values, locale),
    [locale],
  );

  return { locale, t };
};

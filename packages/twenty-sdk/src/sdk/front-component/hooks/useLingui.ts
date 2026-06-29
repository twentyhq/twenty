import { useCallback } from 'react';

import {
  type MessageDescriptor,
  type TranslationValues,
} from '../i18n/message';
import { resolveTranslation } from '../i18n/resolveTranslation';
import { useLocale } from './useLocale';

export type UseLinguiResult = {
  locale: string;
  t: (
    descriptor: string | MessageDescriptor,
    values?: TranslationValues,
  ) => string;
};

// Reactive in-component translation. The returned t() is bound to the current
// locale and changes identity when the locale changes, so components re-render
// with the new language. Use this over the eager t() inside render.
export const useLingui = (): UseLinguiResult => {
  const locale = useLocale();

  const t = useCallback(
    (descriptor: string | MessageDescriptor, values?: TranslationValues) =>
      resolveTranslation(descriptor, values, locale),
    [locale],
  );

  return { locale, t };
};

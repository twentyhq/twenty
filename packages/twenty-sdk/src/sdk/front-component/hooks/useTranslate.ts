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

export const useTranslate = (): UseTranslateResult => {
  const locale = useLocale();

  const t = useCallback(
    (descriptor: string | MessageDescriptor, values?: TranslationValues) =>
      resolveTranslation(descriptor, values, locale),
    [locale],
  );

  return { locale, t };
};

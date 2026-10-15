import { useCallback } from 'react';
import { SOURCE_LOCALE, type AppLocale } from 'twenty-shared/translations';

import {
  type MessageDescriptor,
  type TranslationValues,
} from '../translations/message';
import { getFrontComponentTranslations } from '../translations/front-component-translations';
import { resolveTranslation } from '../translations/resolveTranslation';
import { type FrontComponentExecutionContext } from '../types/FrontComponentExecutionContext';
import { useFrontComponentExecutionContext } from './useFrontComponentExecutionContext';
import { useLocale } from './useLocale';

export type UseTranslateResult = {
  locale: AppLocale;
  t: (
    descriptor: string | MessageDescriptor,
    values?: TranslationValues,
  ) => string;
};

const selectTranslationCatalog = (context: FrontComponentExecutionContext) =>
  getFrontComponentTranslations()[context.locale ?? SOURCE_LOCALE] ??
  context.translationCatalog;

export const useTranslate = (): UseTranslateResult => {
  const locale = useLocale();
  const translationCatalog = useFrontComponentExecutionContext(
    selectTranslationCatalog,
  );

  const t = useCallback(
    (descriptor: string | MessageDescriptor, values?: TranslationValues) =>
      resolveTranslation({
        descriptor,
        values,
        locale,
        catalog: translationCatalog,
      }),
    [locale, translationCatalog],
  );

  return { locale, t };
};

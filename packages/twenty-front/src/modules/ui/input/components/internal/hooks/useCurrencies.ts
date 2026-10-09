import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import { type CurrencyCode } from 'twenty-shared/constants';

import { getCurrencyLabel } from '@/localization/utils/getCurrencyLabel';
import { CURRENCIES } from '@/ui/input/components/internal/currency/constants/Currencies';
import { type Currency } from '@/ui/input/components/internal/types/Currency';

export const useCurrencies = (): Currency[] => {
  const { i18n } = useLingui();

  return useMemo(
    () =>
      CURRENCIES.map((currency) => {
        const currencyLabel = getCurrencyLabel({
          currencyCode: currency.value as CurrencyCode,
          locale: i18n.locale,
        });

        return {
          ...currency,
          label: `${currencyLabel} (${currency.value})`,
        };
      }),
    [i18n.locale],
  );
};

import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import { isWithdrawnCurrencyCode } from 'twenty-shared/utils';

import { getCurrencyLabel } from '@/localization/utils/getCurrencyLabel';
import { CURRENCIES } from '@/ui/input/components/internal/currency/constants/Currencies';
import { type Currency } from '@/ui/input/components/internal/types/Currency';

type UseCurrenciesOptions = {
  shouldIncludeWithdrawnCurrencies?: boolean;
};

export const useCurrencies = ({
  shouldIncludeWithdrawnCurrencies = false,
}: UseCurrenciesOptions = {}): Currency[] => {
  const { i18n } = useLingui();

  return useMemo(
    () =>
      CURRENCIES.filter(
        (currency) =>
          shouldIncludeWithdrawnCurrencies ||
          !isWithdrawnCurrencyCode(currency.value),
      ).map((currency) => {
        const currencyLabel = getCurrencyLabel({
          currencyCode: currency.value,
          locale: i18n.locale,
        });

        return {
          ...currency,
          label: `${currencyLabel} (${currency.value})`,
        };
      }),
    [i18n.locale, shouldIncludeWithdrawnCurrencies],
  );
};

import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';

import { getCurrencyLabel } from '@/localization/utils/getCurrencyLabel';
import { CURRENCIES } from '@/ui/input/components/internal/currency/constants/Currencies';
import { WITHDRAWN_CURRENCY_CODES } from '@/ui/input/components/internal/currency/constants/WithdrawnCurrencyCodes';
import { type Currency } from '@/ui/input/components/internal/types/Currency';

export const useCurrencies = (): Currency[] => {
  const { i18n } = useLingui();

  return useMemo(
    () =>
      CURRENCIES.filter(
        (currency) => !WITHDRAWN_CURRENCY_CODES.has(currency.value),
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
    [i18n.locale],
  );
};

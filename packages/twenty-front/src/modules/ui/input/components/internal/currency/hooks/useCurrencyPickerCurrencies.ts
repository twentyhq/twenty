import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import { type CurrencyCode } from 'twenty-shared/constants';
import { type CurrencyPickerOption } from 'twenty-ui/components';

import { getCurrencyLabel } from '@/localization/utils/getCurrencyLabel';
import { CURRENCY_PICKER_CURRENCIES } from '@/ui/input/components/internal/currency/constants/CurrencyPickerCurrencies';

export const useCurrencyPickerCurrencies = (): CurrencyPickerOption[] => {
  const { i18n } = useLingui();

  return useMemo(
    () =>
      CURRENCY_PICKER_CURRENCIES.map((currency) => ({
        ...currency,
        name: getCurrencyLabel({
          currencyCode: currency.code as CurrencyCode,
          locale: i18n.locale,
        }),
      })),
    [i18n.locale],
  );
};

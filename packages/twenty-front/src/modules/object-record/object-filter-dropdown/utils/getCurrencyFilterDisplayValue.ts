import { t } from '@lingui/core/macro';

const MAX_CURRENCY_NAMES_TO_DISPLAY = 3;

export const getCurrencyFilterDisplayValue = (currencyNames: string[]) => {
  const currenciesLabel = t`currencies`;

  return currencyNames.length > MAX_CURRENCY_NAMES_TO_DISPLAY
    ? `${currencyNames.length} ${currenciesLabel}`
    : currencyNames.join(', ');
};

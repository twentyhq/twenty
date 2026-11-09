import { isString } from '@sniptt/guards';
import { parseJson } from 'twenty-shared/utils';

import { REPLACEMENT_CURRENCY_CODE } from 'src/database/commands/upgrade-version-command/2-57/constants/replacement-currency-code.constant';
import { WITHDRAWN_CURRENCY_CODE } from 'src/database/commands/upgrade-version-command/2-57/constants/withdrawn-currency-code.constant';

export const replaceWithdrawnCurrencyCodeInFilterValue = (
  value: unknown,
): unknown => {
  const currencyCodes = isString(value) ? parseJson<unknown>(value) : value;

  if (
    !Array.isArray(currencyCodes) ||
    !currencyCodes.includes(WITHDRAWN_CURRENCY_CODE)
  ) {
    return value;
  }

  const replacedCurrencyCodes = [
    ...new Set(
      currencyCodes.map((currencyCode) =>
        currencyCode === WITHDRAWN_CURRENCY_CODE
          ? REPLACEMENT_CURRENCY_CODE
          : currencyCode,
      ),
    ),
  ];

  return isString(value)
    ? JSON.stringify(replacedCurrencyCodes)
    : replacedCurrencyCodes;
};

import { isString } from '@sniptt/guards';
import { parseJson } from 'twenty-shared/utils';

import { REPLACEMENT_CURRENCY_CODE } from 'src/database/commands/upgrade-version-command/2-53/constants/replacement-currency-code.constant';
import { WITHDRAWN_CURRENCY_CODE } from 'src/database/commands/upgrade-version-command/2-53/constants/withdrawn-currency-code.constant';
import { type MappedValue } from 'src/database/commands/upgrade-version-command/2-53/types/mapped-value.type';

export const replaceWithdrawnCurrencyCodeInFilterValue = (
  value: unknown,
): MappedValue => {
  if (!isString(value)) {
    return { value, hasChanged: false };
  }

  const currencyCodes = parseJson<unknown>(value);

  if (
    !Array.isArray(currencyCodes) ||
    !currencyCodes.includes(WITHDRAWN_CURRENCY_CODE)
  ) {
    return { value, hasChanged: false };
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

  return { value: JSON.stringify(replacedCurrencyCodes), hasChanged: true };
};

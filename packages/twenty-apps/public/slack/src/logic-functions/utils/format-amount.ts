import { isDefined } from 'twenty-sdk/utils';

import { asFiniteNumber } from 'src/logic-functions/utils/as-finite-number';
import { asNonEmptyString } from 'src/logic-functions/utils/as-non-empty-string';

export const formatAmount = (
  amount: Record<string, unknown> | undefined,
): string | undefined => {
  const amountMicros = asFiniteNumber(amount?.amountMicros);

  if (!isDefined(amountMicros)) {
    return undefined;
  }

  const value = amountMicros / 1_000_000;
  const currencyCode = asNonEmptyString(amount?.currencyCode);

  if (isDefined(currencyCode)) {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
        maximumFractionDigits: 2,
      }).format(value);
    } catch {
    }
  }

  return new Intl.NumberFormat('en-US').format(value);
};

import { isNumber } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { readOptionalString } from 'src/logic-functions/utils/read-optional-string.util';

export const formatAmount = (
  amount: Record<string, unknown> | undefined,
): string | undefined => {
  const amountMicros = amount?.amountMicros;

  if (!isNumber(amountMicros) || !Number.isFinite(amountMicros)) {
    return undefined;
  }

  const value = amountMicros / 1_000_000;
  const currencyCode = readOptionalString(amount?.currencyCode);

  if (isDefined(currencyCode)) {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
      }).format(value);
    } catch {
    }
  }

  return new Intl.NumberFormat('en-US').format(value);
};

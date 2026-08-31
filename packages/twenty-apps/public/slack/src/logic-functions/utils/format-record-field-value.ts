import { isDefined } from 'twenty-sdk/utils';

import {
  asFiniteNumber,
  asNonEmptyString,
} from 'src/logic-functions/utils/coerce-record-field-value';

// SELECT values arrive as API enum-like strings such as IN_PROGRESS.
export const humanizeSelectValue = (value: string): string => {
  const words = value.replace(/_/g, ' ').toLowerCase();

  return words.charAt(0).toUpperCase() + words.slice(1);
};

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
      // Falls through for currency codes Intl does not know.
    }
  }

  return new Intl.NumberFormat('en-US').format(value);
};

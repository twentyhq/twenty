import { isNumber, isString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

const MICROS_PER_UNIT = 1_000_000;

// a compact reading of a stored value, enough to compare it with the proposed one
export const formatProposedFieldValue = (value: unknown): string | null => {
  if (!isDefined(value) || value === '') {
    return null;
  }

  if (Array.isArray(value)) {
    const formattedItems = value
      .map(formatProposedFieldValue)
      .filter(isDefined);

    return formattedItems.length > 0 ? formattedItems.join(', ') : null;
  }

  if (isPlainObject(value)) {
    if (isNumber(value.amountMicros)) {
      const amount = value.amountMicros / MICROS_PER_UNIT;

      return isString(value.currencyCode)
        ? `${amount} ${value.currencyCode}`
        : String(amount);
    }

    const formattedParts = Object.values(value)
      .map(formatProposedFieldValue)
      .filter(isDefined);

    return formattedParts.length > 0 ? formattedParts.join(' ') : null;
  }

  return String(value);
};

import { isNumber, isString } from '@sniptt/guards';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { convertCurrencyMicrosToCurrencyAmount } from '~/utils/convertCurrencyToCurrencyMicros';

// a compact reading of a stored value, enough to compare it with the proposed one
export const formatProposedFieldValue = (
  value: unknown,
  fieldType?: FieldMetadataType,
): string | null => {
  if (!isDefined(value) || value === '') {
    return null;
  }

  if (Array.isArray(value)) {
    const formattedItems = value
      .map((item) => formatProposedFieldValue(item))
      .filter(isDefined);

    return formattedItems.length > 0 ? formattedItems.join(', ') : null;
  }

  if (isPlainObject(value)) {
    if (
      fieldType === FieldMetadataType.CURRENCY &&
      isNumber(value.amountMicros)
    ) {
      const amount = convertCurrencyMicrosToCurrencyAmount(value.amountMicros);

      return isString(value.currencyCode)
        ? `${amount} ${value.currencyCode}`
        : String(amount);
    }

    const formattedParts = Object.values(value)
      .map((part) => formatProposedFieldValue(part))
      .filter(isDefined);

    return formattedParts.length > 0 ? formattedParts.join(' ') : null;
  }

  return String(value);
};

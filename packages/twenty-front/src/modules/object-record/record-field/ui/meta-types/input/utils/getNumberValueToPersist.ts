import { isNull } from '@sniptt/guards';
import { type FieldNumberVariant } from 'twenty-shared/types';

import {
  canBeCastAsNumberOrNull,
  castAsNumberOrNull,
} from '~/utils/cast-as-number-or-null';

type GetNumberValueToPersistArgs = {
  newValue: string;
  numberType?: FieldNumberVariant;
};

type GetNumberValueToPersistResult = {
  success: boolean;
  value?: number | null;
};

export const getNumberValueToPersist = ({
  newValue,
  numberType,
}: GetNumberValueToPersistArgs): GetNumberValueToPersistResult => {
  if (numberType === 'percentage') {
    const trimmedValue = newValue.trim();

    if (trimmedValue === '%') {
      return { success: false };
    }

    const valueWithoutPercent = trimmedValue.endsWith('%')
      ? trimmedValue.slice(0, -1).trim()
      : trimmedValue;

    if (
      valueWithoutPercent.includes('%') ||
      !canBeCastAsNumberOrNull(valueWithoutPercent)
    ) {
      return { success: false };
    }

    const castedValue = castAsNumberOrNull(valueWithoutPercent);

    if (!isNull(castedValue)) {
      return { success: true, value: castedValue / 100 };
    }

    return { success: true, value: null };
  }

  if (!canBeCastAsNumberOrNull(newValue)) {
    return { success: false };
  }

  const castedValue = castAsNumberOrNull(newValue);

  return { success: true, value: castedValue };
};

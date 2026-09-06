import { isNull } from '@sniptt/guards';

import {
  canBeCastAsNumberOrNull,
  castAsNumberOrNull,
} from '~/utils/cast-as-number-or-null';

type GetNumberValueToPersistArgs = {
  newValue: string;
  numberType?: string;
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
    const newValueEscaped = newValue.replaceAll('%', '');

    if (!canBeCastAsNumberOrNull(newValueEscaped)) {
      return { success: false };
    }

    const castedValue = castAsNumberOrNull(newValueEscaped);

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

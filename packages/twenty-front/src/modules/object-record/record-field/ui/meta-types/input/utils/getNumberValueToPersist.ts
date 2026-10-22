import { isNull } from '@sniptt/guards';

import { PERCENTAGE_VALUE_PRECISION } from '@/object-record/record-field/ui/constants/PercentageValuePrecision';
import { type FieldNumberVariant } from '@/object-record/record-field/ui/types/FieldMetadata';
import {
  canBeCastAsNumberOrNull,
  castAsNumberOrNull,
} from '~/utils/cast-as-number-or-null';

type NumberValueToPersistResult =
  | { success: false }
  | { success: true; value: number | null };

type GetNumberValueToPersistParams = {
  newValue: string;
  numberType?: FieldNumberVariant;
};

export const getNumberValueToPersist = ({
  newValue,
  numberType,
}: GetNumberValueToPersistParams): NumberValueToPersistResult => {
  const valueToCast =
    numberType === 'percentage' ? newValue.replace(/%$/, '') : newValue;

  if (!canBeCastAsNumberOrNull(valueToCast)) {
    return { success: false };
  }

  const castedValue = castAsNumberOrNull(valueToCast);

  if (numberType === 'percentage' && !isNull(castedValue)) {
    return {
      success: true,
      value: parseFloat(
        (castedValue / 100).toPrecision(PERCENTAGE_VALUE_PRECISION),
      ),
    };
  }

  return { success: true, value: castedValue };
};

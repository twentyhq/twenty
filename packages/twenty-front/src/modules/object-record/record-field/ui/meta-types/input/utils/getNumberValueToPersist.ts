import { isNull } from '@sniptt/guards';

import { type FieldNumberVariant } from '@/object-record/record-field/ui/types/FieldMetadata';
import {
  canBeCastAsNumberOrNull,
  castAsNumberOrNull,
} from '~/utils/cast-as-number-or-null';

export type NumberValueToPersistResult =
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
    numberType === 'percentage' ? newValue.replaceAll('%', '') : newValue;

  if (!canBeCastAsNumberOrNull(valueToCast)) {
    return { success: false };
  }

  const castedValue = castAsNumberOrNull(valueToCast);

  if (numberType === 'percentage' && !isNull(castedValue)) {
    return { success: true, value: castedValue / 100 };
  }

  return { success: true, value: castedValue };
};

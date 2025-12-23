import { isNull, isNumber } from '@sniptt/guards';

import { type FieldNumberValue } from '@/modules/object-record/record-field/ui/types/FieldMetadata';

// TODO: add zod
export const isFieldNumberValue = (
  fieldValue: unknown,
): fieldValue is FieldNumberValue => isNull(fieldValue) || isNumber(fieldValue);

import { isNull, isString } from '@sniptt/guards';

import { type FieldDateTimeValue } from '@/object-record/record-field/ui/types/FieldMetadata';

// TODO: add zod
export const isFieldDateTimeValue = (
  fieldValue: unknown,
): fieldValue is FieldDateTimeValue =>
  (isString(fieldValue) && !isNaN(Date.parse(fieldValue))) ||
  isNull(fieldValue);

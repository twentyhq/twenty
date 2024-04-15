import { isNull, isString } from '@sniptt/guards';

import { FieldDateValue } from '@/object-record/record-field/types/FieldMetadata';

// TODO: add zod
export const isFieldDateValue = (
  fieldValue: unknown,
): fieldValue is FieldDateValue =>
  (isString(fieldValue) && !isNaN(Date.parse(fieldValue))) ||
  isNull(fieldValue);

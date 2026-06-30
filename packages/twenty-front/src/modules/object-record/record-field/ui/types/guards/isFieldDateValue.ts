import { isNull, isString } from '@sniptt/guards';

import { type FieldDateValue } from '@/object-record/record-field/ui/types/FieldMetadata';

// TODO: add zod
export const isFieldDateValue = (
  fieldValue: unknown,
): fieldValue is FieldDateValue =>
  (isString(fieldValue) && !isNaN(Date.parse(fieldValue))) ||
  isNull(fieldValue);

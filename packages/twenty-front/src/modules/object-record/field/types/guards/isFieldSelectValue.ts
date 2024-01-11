import { isString } from '@sniptt/guards';

import { FieldSelectValue } from '@/object-record/field/types/FieldMetadata';

export const isFieldSelectValue = (
  fieldValue: unknown,
): fieldValue is FieldSelectValue => isString(fieldValue);

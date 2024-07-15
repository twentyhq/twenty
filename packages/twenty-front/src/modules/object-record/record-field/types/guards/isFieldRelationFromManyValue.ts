import { isNull, isObject, isUndefined } from '@sniptt/guards';

import { FieldRelationFromManyValue } from '@/object-record/record-field/types/FieldMetadata';

// TODO: add zod
export const isFieldRelationFromManyValue = (
  fieldValue: unknown,
): fieldValue is FieldRelationFromManyValue =>
  !isUndefined(fieldValue) && (isObject(fieldValue) || isNull(fieldValue));

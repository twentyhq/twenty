import { isNull, isObject, isUndefined } from '@sniptt/guards';

import { type FieldRelationFromManyValue } from '@/object-record/record-field/ui/types/FieldMetadata';

// TODO: add zod
export const isFieldRelationFromManyValue = (
  fieldValue: unknown,
): fieldValue is FieldRelationFromManyValue =>
  !isUndefined(fieldValue) && (isObject(fieldValue) || isNull(fieldValue));

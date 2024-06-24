import { isNull, isObject, isUndefined } from '@sniptt/guards';

import { FieldRelationToOneValue } from '@/object-record/record-field/types/FieldMetadata';

// TODO: add zod
export const isFieldRelationToOneValue = (
  fieldValue: unknown,
): fieldValue is FieldRelationToOneValue =>
  !isUndefined(fieldValue) && (isObject(fieldValue) || isNull(fieldValue));

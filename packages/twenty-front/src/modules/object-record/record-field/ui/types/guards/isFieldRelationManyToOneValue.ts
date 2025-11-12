import { isNull, isObject, isUndefined } from '@sniptt/guards';

import { type FieldRelationToOneValue } from '@/object-record/record-field/ui/types/FieldMetadata';

// TODO: add zod
export const isFieldRelationManyToOneValue = (
  fieldValue: unknown,
): fieldValue is FieldRelationToOneValue =>
  !isUndefined(fieldValue) && (isObject(fieldValue) || isNull(fieldValue));

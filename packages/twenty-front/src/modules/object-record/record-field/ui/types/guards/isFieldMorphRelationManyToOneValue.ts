import { isObject, isString } from '@sniptt/guards';

import { type FieldMorphRelationManyToOneValue } from '@/object-record/record-field/ui/types/FieldMetadata';

export const isFieldMorphRelationManyToOneValue = (
  fieldValue: unknown,
): fieldValue is NonNullable<FieldMorphRelationManyToOneValue> =>
  isObject(fieldValue) &&
  'objectNameSingular' in fieldValue &&
  isString(fieldValue.objectNameSingular);

import { isArray } from '@sniptt/guards';

import { type FieldMorphRelationOneToManyValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldMorphRelationManyToOneValue } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelationManyToOneValue';

export const isFieldMorphRelationOneToManyValue = (
  fieldValue: unknown,
): fieldValue is FieldMorphRelationOneToManyValue =>
  isArray(fieldValue) &&
  fieldValue.every(
    (morphValue) =>
      isFieldMorphRelationManyToOneValue(morphValue) &&
      isArray(morphValue.value),
  );

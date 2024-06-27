import { isFieldRelation } from '@/object-record/record-field/types/guards/isFieldRelation';

import { FieldDefinition } from '../FieldDefinition';
import { FieldMetadata, FieldRelationManyMetadata } from '../FieldMetadata';

export const isFieldRelationFromManyObjects = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type' | 'metadata'>,
): field is FieldDefinition<FieldRelationManyMetadata> =>
  isFieldRelation(field) && field.metadata.relationType === 'FROM_MANY_OBJECTS';

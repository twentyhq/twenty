import { isFieldRelation } from '@/object-record/record-field/types/guards/isFieldRelation';

import { FieldDefinition } from '../FieldDefinition';
import { FieldMetadata, FieldRelationOneMetadata } from '../FieldMetadata';

export const isFieldRelationToOneObject = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type' | 'metadata'>,
): field is FieldDefinition<FieldRelationOneMetadata> =>
  isFieldRelation(field) && field.metadata.relationType === 'TO_ONE_OBJECT';

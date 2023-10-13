import { FieldDefinition } from '../FieldDefinition';
import { FieldMetadata, FieldRelationMetadata } from '../FieldMetadata';

export const isFieldRelation = (
  field: FieldDefinition<FieldMetadata>,
): field is FieldDefinition<FieldRelationMetadata> => field.type === 'relation';

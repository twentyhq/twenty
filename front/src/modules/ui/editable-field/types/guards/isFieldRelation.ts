import { FieldDefinition } from '../FieldDefinition';
import { FieldMetadata, FieldRelationMetadata } from '../FieldMetadata';

export function isFieldRelation(
  field: FieldDefinition<FieldMetadata>,
): field is FieldDefinition<FieldRelationMetadata> {
  return field.type === 'relation';
}

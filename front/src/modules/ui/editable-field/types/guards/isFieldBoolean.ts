import { FieldDefinition } from '../FieldDefinition';
import { FieldBooleanMetadata, FieldMetadata } from '../FieldMetadata';

export function isFieldBoolean(
  field: FieldDefinition<FieldMetadata>,
): field is FieldDefinition<FieldBooleanMetadata> {
  return field.type === 'boolean';
}

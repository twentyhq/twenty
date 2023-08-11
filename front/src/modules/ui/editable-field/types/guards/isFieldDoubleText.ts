import { FieldDefinition } from '../FieldDefinition';
import { FieldDoubleTextMetadata, FieldMetadata } from '../FieldMetadata';

export function isFieldDoubleText(
  field: FieldDefinition<FieldMetadata>,
): field is FieldDefinition<FieldDoubleTextMetadata> {
  return field.type === 'double-text';
}

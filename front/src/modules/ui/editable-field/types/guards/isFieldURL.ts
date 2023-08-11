import { FieldDefinition } from '../FieldDefinition';
import { FieldMetadata, FieldURLMetadata } from '../FieldMetadata';

export function isFieldURL(
  field: FieldDefinition<FieldMetadata>,
): field is FieldDefinition<FieldURLMetadata> {
  return field.type === 'url';
}

import { FieldDefinition } from '../FieldDefinition';
import { FieldMetadata, FieldTextMetadata } from '../FieldMetadata';

export function isFieldText(
  field: FieldDefinition<FieldMetadata>,
): field is FieldDefinition<FieldTextMetadata> {
  return field.type === 'text';
}

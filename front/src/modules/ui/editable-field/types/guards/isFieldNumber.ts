import { FieldDefinition } from '../FieldDefinition';
import { FieldMetadata, FieldNumberMetadata } from '../FieldMetadata';

export function isFieldNumber(
  field: FieldDefinition<FieldMetadata>,
): field is FieldDefinition<FieldNumberMetadata> {
  return field.type === 'number';
}

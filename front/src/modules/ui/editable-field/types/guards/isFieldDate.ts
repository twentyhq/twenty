import { FieldDefinition } from '../FieldDefinition';
import { FieldDateMetadata, FieldMetadata } from '../FieldMetadata';

export function isFieldDate(
  field: FieldDefinition<FieldMetadata>,
): field is FieldDefinition<FieldDateMetadata> {
  return field.type === 'date';
}

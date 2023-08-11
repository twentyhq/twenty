import { FieldDefinition } from '../FieldDefinition';
import { FieldChipMetadata, FieldMetadata } from '../FieldMetadata';

export function isFieldChip(
  field: FieldDefinition<FieldMetadata>,
): field is FieldDefinition<FieldChipMetadata> {
  return field.type === 'chip';
}

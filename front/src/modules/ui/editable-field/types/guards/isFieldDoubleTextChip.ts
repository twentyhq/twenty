import { FieldDefinition } from '../FieldDefinition';
import { FieldDoubleTextChipMetadata, FieldMetadata } from '../FieldMetadata';

export function isFieldDoubleTextChip(
  field: FieldDefinition<FieldMetadata>,
): field is FieldDefinition<FieldDoubleTextChipMetadata> {
  return field.type === 'double-text-chip';
}

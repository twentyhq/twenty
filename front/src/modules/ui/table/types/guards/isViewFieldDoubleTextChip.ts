import {
  ViewFieldDefinition,
  ViewFieldDoubleTextChipMetadata,
  ViewFieldMetadata,
} from '../ViewField';

export function isViewFieldDoubleTextChip(
  field: ViewFieldDefinition<ViewFieldMetadata>,
): field is ViewFieldDefinition<ViewFieldDoubleTextChipMetadata> {
  return field.metadata.type === 'double-text-chip';
}

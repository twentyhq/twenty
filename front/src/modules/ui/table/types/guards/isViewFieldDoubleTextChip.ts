import {
  ViewFieldDefinition,
  ViewFieldDoubleTextChipMetadata,
} from '../ViewField';

export function isViewFieldDoubleTextChip(
  field: ViewFieldDefinition<unknown>,
): field is ViewFieldDefinition<ViewFieldDoubleTextChipMetadata> {
  return field.type === 'double-text-chip';
}

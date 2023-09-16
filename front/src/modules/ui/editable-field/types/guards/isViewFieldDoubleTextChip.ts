import {
  ViewFieldDefinition,
  ViewFieldDoubleTextChipMetadata,
  ViewFieldMetadata,
} from '../ViewField';

export const isViewFieldDoubleTextChip = (
  field: ViewFieldDefinition<ViewFieldMetadata>,
): field is ViewFieldDefinition<ViewFieldDoubleTextChipMetadata> =>
  field.metadata.type === 'double-text-chip';

import {
  ViewFieldChipMetadata,
  ViewFieldDefinition,
  ViewFieldMetadata,
} from '../ViewField';

export function isViewFieldChip(
  field: ViewFieldDefinition<ViewFieldMetadata>,
): field is ViewFieldDefinition<ViewFieldChipMetadata> {
  return field.metadata.type === 'chip';
}

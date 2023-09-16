import {
  ViewFieldChipMetadata,
  ViewFieldDefinition,
  ViewFieldMetadata,
} from '../ViewField';

export const isViewFieldChip = (
  field: ViewFieldDefinition<ViewFieldMetadata>,
): field is ViewFieldDefinition<ViewFieldChipMetadata> =>
  field.metadata.type === 'chip';

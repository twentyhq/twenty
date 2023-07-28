import { ViewFieldChipMetadata, ViewFieldDefinition } from '../ViewField';

export function isViewFieldChip(
  field: ViewFieldDefinition<unknown>,
): field is ViewFieldDefinition<ViewFieldChipMetadata> {
  return field.type === 'chip';
}

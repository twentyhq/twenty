import {
  ViewFieldDefinition,
  ViewFieldMetadata,
  ViewFieldURLMetadata,
} from '../ViewField';

export function isViewFieldURL(
  field: ViewFieldDefinition<ViewFieldMetadata>,
): field is ViewFieldDefinition<ViewFieldURLMetadata> {
  return field.metadata.type === 'url';
}

import {
  ViewFieldDefinition,
  ViewFieldDoubleTextMetadata,
  ViewFieldMetadata,
} from '../ViewField';

export function isViewFieldDoubleText(
  field: ViewFieldDefinition<ViewFieldMetadata>,
): field is ViewFieldDefinition<ViewFieldDoubleTextMetadata> {
  return field.metadata.type === 'double-text';
}

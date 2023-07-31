import {
  ViewFieldDefinition,
  ViewFieldMetadata,
  ViewFieldTextMetadata,
} from '../ViewField';

export function isViewFieldText(
  field: ViewFieldDefinition<ViewFieldMetadata>,
): field is ViewFieldDefinition<ViewFieldTextMetadata> {
  return field.metadata.type === 'text';
}

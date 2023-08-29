import {
  ViewFieldDefinition,
  ViewFieldEmailMetadata,
  ViewFieldMetadata,
} from '../ViewField';

export function isViewFieldEmail(
  field: ViewFieldDefinition<ViewFieldMetadata>,
): field is ViewFieldDefinition<ViewFieldEmailMetadata> {
  return field.metadata.type === 'email';
}

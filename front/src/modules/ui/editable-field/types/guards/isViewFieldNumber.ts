import {
  ViewFieldDefinition,
  ViewFieldMetadata,
  ViewFieldNumberMetadata,
} from '../ViewField';

export function isViewFieldNumber(
  field: ViewFieldDefinition<ViewFieldMetadata>,
): field is ViewFieldDefinition<ViewFieldNumberMetadata> {
  return field.metadata.type === 'number';
}

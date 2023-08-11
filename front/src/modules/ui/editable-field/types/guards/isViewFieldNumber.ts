import {
  ViewFieldDefinition,
  ViewFieldMetadata,
  ViewFieldNumberMetadata,
} from '../ViewField';

export function isViewFieldNumber(
  field: ViewFieldDefinition<ViewFieldMetadata>,
): field is ViewFieldDefinition<ViewFieldNumberMetadata> {
  console.log(field);
  return field.metadata.type === 'number';
}

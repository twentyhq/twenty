import {
  ViewFieldBooleanMetadata,
  ViewFieldDefinition,
  ViewFieldMetadata,
} from '../ViewField';

export function isViewFieldBoolean(
  field: ViewFieldDefinition<ViewFieldMetadata>,
): field is ViewFieldDefinition<ViewFieldBooleanMetadata> {
  return field.metadata.type === 'boolean';
}

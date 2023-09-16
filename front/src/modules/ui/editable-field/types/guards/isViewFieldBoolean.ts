import {
  ViewFieldBooleanMetadata,
  ViewFieldDefinition,
  ViewFieldMetadata,
} from '../ViewField';

export const isViewFieldBoolean = (
  field: ViewFieldDefinition<ViewFieldMetadata>,
): field is ViewFieldDefinition<ViewFieldBooleanMetadata> =>
  field.metadata.type === 'boolean';

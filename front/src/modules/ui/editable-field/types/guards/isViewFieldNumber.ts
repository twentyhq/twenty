import {
  ViewFieldDefinition,
  ViewFieldMetadata,
  ViewFieldNumberMetadata,
} from '../ViewField';

export const isViewFieldNumber = (
  field: ViewFieldDefinition<ViewFieldMetadata>,
): field is ViewFieldDefinition<ViewFieldNumberMetadata> =>
  field.metadata.type === 'number';

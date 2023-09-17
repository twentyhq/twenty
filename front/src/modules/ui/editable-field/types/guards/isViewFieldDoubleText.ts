import {
  ViewFieldDefinition,
  ViewFieldDoubleTextMetadata,
  ViewFieldMetadata,
} from '../ViewField';

export const isViewFieldDoubleText = (
  field: ViewFieldDefinition<ViewFieldMetadata>,
): field is ViewFieldDefinition<ViewFieldDoubleTextMetadata> =>
  field.metadata.type === 'double-text';

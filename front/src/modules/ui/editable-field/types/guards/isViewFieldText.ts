import {
  ViewFieldDefinition,
  ViewFieldMetadata,
  ViewFieldTextMetadata,
} from '../ViewField';

export const isViewFieldText = (
  field: ViewFieldDefinition<ViewFieldMetadata>,
): field is ViewFieldDefinition<ViewFieldTextMetadata> =>
  field.metadata.type === 'text';

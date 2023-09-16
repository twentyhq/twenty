import {
  ViewFieldDefinition,
  ViewFieldMetadata,
  ViewFieldURLMetadata,
} from '../ViewField';

export const isViewFieldURL = (
  field: ViewFieldDefinition<ViewFieldMetadata>,
): field is ViewFieldDefinition<ViewFieldURLMetadata> =>
  field.metadata.type === 'url';

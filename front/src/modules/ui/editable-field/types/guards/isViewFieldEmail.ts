import {
  ViewFieldDefinition,
  ViewFieldEmailMetadata,
  ViewFieldMetadata,
} from '../ViewField';

export const isViewFieldEmail = (
  field: ViewFieldDefinition<ViewFieldMetadata>,
): field is ViewFieldDefinition<ViewFieldEmailMetadata> =>
  field.metadata.type === 'email';

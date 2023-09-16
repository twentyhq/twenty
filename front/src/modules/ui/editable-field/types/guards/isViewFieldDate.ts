import {
  ViewFieldDateMetadata,
  ViewFieldDefinition,
  ViewFieldMetadata,
} from '../ViewField';

export const isViewFieldDate = (
  field: ViewFieldDefinition<ViewFieldMetadata>,
): field is ViewFieldDefinition<ViewFieldDateMetadata> =>
  field.metadata.type === 'date';

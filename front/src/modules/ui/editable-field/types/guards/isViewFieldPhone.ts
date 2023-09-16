import {
  ViewFieldDefinition,
  ViewFieldMetadata,
  ViewFieldPhoneMetadata,
} from '../ViewField';

export const isViewFieldPhone = (
  field: ViewFieldDefinition<ViewFieldMetadata>,
): field is ViewFieldDefinition<ViewFieldPhoneMetadata> =>
  field.metadata.type === 'phone';

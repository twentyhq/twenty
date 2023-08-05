import {
  ViewFieldDefinition,
  ViewFieldMetadata,
  ViewFieldPhoneMetadata,
} from '../ViewField';

export function isViewFieldPhone(
  field: ViewFieldDefinition<ViewFieldMetadata>,
): field is ViewFieldDefinition<ViewFieldPhoneMetadata> {
  return field.metadata.type === 'phone';
}

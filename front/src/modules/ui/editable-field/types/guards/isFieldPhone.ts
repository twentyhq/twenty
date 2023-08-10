import { FieldDefinition } from '../FieldDefinition';
import { FieldMetadata, FieldPhoneMetadata } from '../FieldMetadata';

export function isFieldPhone(
  field: FieldDefinition<FieldMetadata>,
): field is FieldDefinition<FieldPhoneMetadata> {
  return field.type === 'phone';
}

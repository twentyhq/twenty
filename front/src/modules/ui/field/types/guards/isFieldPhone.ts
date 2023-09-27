import { FieldDefinition } from '../FieldDefinition';
import { FieldMetadata, FieldPhoneMetadata } from '../FieldMetadata';

export const isFieldPhone = (
  field: FieldDefinition<FieldMetadata>,
): field is FieldDefinition<FieldPhoneMetadata> => field.type === 'phone';

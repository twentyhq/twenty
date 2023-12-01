import { FieldDefinition } from '../FieldDefinition';
import { FieldMetadata, FieldPhoneMetadata } from '../FieldMetadata';

export const isFieldPhone = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type' | 'metadata'>,
): field is FieldDefinition<FieldPhoneMetadata> =>
  field.metadata.objectMetadataNameSingular === 'person' &&
  field.metadata.fieldName === 'phone' &&
  field.type === 'TEXT';

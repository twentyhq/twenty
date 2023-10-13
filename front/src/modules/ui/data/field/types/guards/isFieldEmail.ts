import { FieldDefinition } from '../FieldDefinition';
import { FieldEmailMetadata, FieldMetadata } from '../FieldMetadata';

export const isFieldEmail = (
  field: FieldDefinition<FieldMetadata>,
): field is FieldDefinition<FieldEmailMetadata> => field.type === 'email';

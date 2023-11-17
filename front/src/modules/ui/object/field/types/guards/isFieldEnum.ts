import { FieldDefinition } from '../FieldDefinition';
import { FieldEnumMetadata, FieldMetadata } from '../FieldMetadata';

export const isFieldEnum = (
  field: FieldDefinition<FieldMetadata>,
): field is FieldDefinition<FieldEnumMetadata> => field.type === 'ENUM';

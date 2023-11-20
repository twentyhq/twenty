import { FieldDefinition } from '../FieldDefinition';
import { FieldEnumMetadata, FieldMetadata } from '../FieldMetadata';

export const isFieldEnum = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldEnumMetadata> => field.type === 'ENUM';

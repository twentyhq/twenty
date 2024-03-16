import { FieldDefinition } from '../FieldDefinition';
import { FieldAddressMetadata, FieldMetadata } from '../FieldMetadata';

export const isFieldAddress = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldAddressMetadata> => field.type === 'ADDRESS';

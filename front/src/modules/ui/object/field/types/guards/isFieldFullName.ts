import { FieldDefinition } from '../FieldDefinition';
import { FieldCurrencyMetadata, FieldMetadata } from '../FieldMetadata';

export const isFieldFullName = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldCurrencyMetadata> =>
  field.type === 'FULL_NAME';

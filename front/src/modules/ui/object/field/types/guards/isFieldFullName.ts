import { FieldDefinition } from '../FieldDefinition';
import { FieldCurrencyMetadata, FieldMetadata } from '../FieldMetadata';

export const isFieldFullName = (
  field: FieldDefinition<FieldMetadata>,
): field is FieldDefinition<FieldCurrencyMetadata> =>
  field.type === 'FULL_NAME';

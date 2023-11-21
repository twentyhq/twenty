import { FieldDefinition } from '../FieldDefinition';
import { FieldCurrencyMetadata, FieldMetadata } from '../FieldMetadata';

export const isFieldCurrency = (
  field: FieldDefinition<FieldMetadata>,
): field is FieldDefinition<FieldCurrencyMetadata> => field.type === 'CURRENCY';

import { FieldDefinition } from '../FieldDefinition';
import { FieldMetadata, FieldMoneyMetadata } from '../FieldMetadata';

export const isFieldMoney = (
  field: FieldDefinition<FieldMetadata>,
): field is FieldDefinition<FieldMoneyMetadata> => field.type === 'moneyAmount';

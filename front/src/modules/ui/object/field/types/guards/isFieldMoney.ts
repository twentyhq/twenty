import { FieldDefinition } from '../FieldDefinition';
import { FieldMetadata, FieldMoneyMetadata } from '../FieldMetadata';

export const isFieldMoney = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldMoneyMetadata> =>
  field.type === 'MONEY_AMOUNT';

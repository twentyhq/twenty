import { FieldDefinition } from '../FieldDefinition';
import { FieldMetadata, FieldMoneyAmountV2Metadata } from '../FieldMetadata';

export const isFieldMoneyAmountV2 = (
  field: FieldDefinition<FieldMetadata>,
): field is FieldDefinition<FieldMoneyAmountV2Metadata> =>
  field.type === 'MONEY_AMOUNT_V2';

import {
  ViewFieldDefinition,
  ViewFieldMetadata,
  ViewFieldMoneyMetadata,
} from '../ViewField';

export const isViewFieldMoney = (
  field: ViewFieldDefinition<ViewFieldMetadata>,
): field is ViewFieldDefinition<ViewFieldMoneyMetadata> =>
  field.metadata.type === 'moneyAmount';

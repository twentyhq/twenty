import {
  ViewFieldDefinition,
  ViewFieldMetadata,
  ViewFieldMoneyMetadata,
} from '../ViewField';

export function isViewFieldMoney(
  field: ViewFieldDefinition<ViewFieldMetadata>,
): field is ViewFieldDefinition<ViewFieldMoneyMetadata> {
  return field.metadata.type === 'moneyAmount';
}

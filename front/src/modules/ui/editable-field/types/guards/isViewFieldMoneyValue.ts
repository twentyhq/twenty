import { ViewFieldMoneyValue } from '../ViewField';

export function isViewFieldMoneyValue(
  fieldValue: unknown,
): fieldValue is ViewFieldMoneyValue {
  return typeof fieldValue === 'number';
}

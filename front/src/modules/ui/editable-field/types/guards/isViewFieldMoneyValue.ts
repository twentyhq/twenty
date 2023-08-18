import { ViewFieldMoneyValue } from '../ViewField';

export function isViewFieldMoneyValue(
  fieldValue: unknown,
): fieldValue is ViewFieldMoneyValue {
  return (
    fieldValue !== null &&
    fieldValue !== undefined &&
    typeof fieldValue === 'number'
  );
}

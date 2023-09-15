import { ViewFieldMoneyValue } from '../ViewField';

export const isViewFieldMoneyValue = (
  fieldValue: unknown,
): fieldValue is ViewFieldMoneyValue =>
  fieldValue === null ||
  (fieldValue !== undefined && typeof fieldValue === 'number');

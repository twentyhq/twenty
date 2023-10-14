import { FieldMoneyValue } from '../FieldMetadata';

// TODO: add yup
export const isFieldMoneyValue = (
  fieldValue: unknown,
): fieldValue is FieldMoneyValue =>
  fieldValue === null ||
  (fieldValue !== undefined && typeof fieldValue === 'number');

import { FieldDateValue } from '../FieldMetadata';

// TODO: add yup
export const isFieldDateValue = (
  fieldValue: unknown,
): fieldValue is FieldDateValue =>
  fieldValue === null ||
  (fieldValue !== undefined && typeof fieldValue === 'string');

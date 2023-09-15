import { FieldNumberValue } from '../FieldMetadata';

// TODO: add yup
export const isFieldNumberValue = (
  fieldValue: unknown,
): fieldValue is FieldNumberValue =>
  fieldValue === null ||
  (fieldValue !== undefined && typeof fieldValue === 'number');

import { FieldTextValue } from '../FieldMetadata';

// TODO: add yup
export const isFieldTextValue = (
  fieldValue: unknown,
): fieldValue is FieldTextValue =>
  fieldValue !== null &&
  fieldValue !== undefined &&
  typeof fieldValue === 'string';

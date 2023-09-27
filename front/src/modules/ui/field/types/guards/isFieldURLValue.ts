import { FieldURLValue } from '../FieldMetadata';

// TODO: add yup
export const isFieldURLValue = (
  fieldValue: unknown,
): fieldValue is FieldURLValue =>
  fieldValue !== null &&
  fieldValue !== undefined &&
  typeof fieldValue === 'string';

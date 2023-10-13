import { FieldEmailValue } from '../FieldMetadata';

// TODO: add yup
export const isFieldEmailValue = (
  fieldValue: unknown,
): fieldValue is FieldEmailValue =>
  fieldValue !== null &&
  fieldValue !== undefined &&
  typeof fieldValue === 'string';

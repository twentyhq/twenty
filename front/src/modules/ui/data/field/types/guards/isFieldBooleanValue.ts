import { FieldBooleanValue } from '../FieldMetadata';

// TODO: add yup
export const isFieldBooleanValue = (
  fieldValue: unknown,
): fieldValue is FieldBooleanValue =>
  fieldValue !== null &&
  fieldValue !== undefined &&
  typeof fieldValue === 'boolean';

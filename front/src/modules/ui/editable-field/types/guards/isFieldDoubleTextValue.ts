import { FieldDoubleTextValue } from '../FieldMetadata';

// TODO: add yup
export const isFieldDoubleTextValue = (
  fieldValue: unknown,
): fieldValue is FieldDoubleTextValue =>
  fieldValue !== null &&
  fieldValue !== undefined &&
  typeof fieldValue === 'object';

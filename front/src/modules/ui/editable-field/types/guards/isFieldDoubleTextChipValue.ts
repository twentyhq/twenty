import { FieldDoubleTextChipValue } from '../FieldMetadata';

// TODO: add yup
export const isFieldDoubleTextChipValue = (
  fieldValue: unknown,
): fieldValue is FieldDoubleTextChipValue =>
  fieldValue !== null &&
  fieldValue !== undefined &&
  typeof fieldValue === 'object';

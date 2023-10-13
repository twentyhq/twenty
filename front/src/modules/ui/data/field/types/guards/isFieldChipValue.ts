import { FieldChipValue } from '../FieldMetadata';

// TODO: add yup
export const isFieldChipValue = (
  fieldValue: unknown,
): fieldValue is FieldChipValue =>
  fieldValue !== null &&
  fieldValue !== undefined &&
  typeof fieldValue === 'string';

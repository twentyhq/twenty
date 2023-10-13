import { FieldPhoneValue } from '../FieldMetadata';

// TODO: add yup
export const isFieldPhoneValue = (
  fieldValue: unknown,
): fieldValue is FieldPhoneValue =>
  fieldValue !== null &&
  fieldValue !== undefined &&
  typeof fieldValue === 'string';

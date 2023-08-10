import { FieldPhoneValue } from '../FieldMetadata';

// TODO: add yup
export function isFieldPhoneValue(
  fieldValue: unknown,
): fieldValue is FieldPhoneValue {
  return (
    fieldValue !== null &&
    fieldValue !== undefined &&
    typeof fieldValue === 'string'
  );
}

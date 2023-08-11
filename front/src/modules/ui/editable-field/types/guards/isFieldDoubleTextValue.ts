import { FieldDoubleTextValue } from '../FieldMetadata';

// TODO: add yup
export function isFieldDoubleTextValue(
  fieldValue: unknown,
): fieldValue is FieldDoubleTextValue {
  return (
    fieldValue !== null &&
    fieldValue !== undefined &&
    typeof fieldValue === 'object'
  );
}

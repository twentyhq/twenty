import { FieldTextValue } from '../FieldMetadata';

// TODO: add yup
export function isFieldTextValue(
  fieldValue: unknown,
): fieldValue is FieldTextValue {
  return (
    fieldValue !== null &&
    fieldValue !== undefined &&
    typeof fieldValue === 'string'
  );
}

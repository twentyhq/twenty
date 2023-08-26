import { FieldBooleanValue } from '../FieldMetadata';

// TODO: add yup
export function isFieldBooleanValue(
  fieldValue: unknown,
): fieldValue is FieldBooleanValue {
  return (
    fieldValue !== null &&
    fieldValue !== undefined &&
    typeof fieldValue === 'boolean'
  );
}

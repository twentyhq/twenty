import { FieldURLValue } from '../FieldMetadata';

// TODO: add yup
export function isFieldURLValue(
  fieldValue: unknown,
): fieldValue is FieldURLValue {
  return (
    fieldValue !== null &&
    fieldValue !== undefined &&
    typeof fieldValue === 'string'
  );
}

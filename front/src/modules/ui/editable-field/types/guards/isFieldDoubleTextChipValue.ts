import { FieldDoubleTextChipValue } from '../FieldMetadata';

// TODO: add yup
export function isFieldDoubleTextChipValue(
  fieldValue: unknown,
): fieldValue is FieldDoubleTextChipValue {
  return (
    fieldValue !== null &&
    fieldValue !== undefined &&
    typeof fieldValue === 'object'
  );
}

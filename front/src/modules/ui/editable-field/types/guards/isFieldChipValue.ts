import { FieldChipValue } from '../FieldMetadata';

// TODO: add yup
export function isFieldChipValue(
  fieldValue: unknown,
): fieldValue is FieldChipValue {
  return (
    fieldValue !== null &&
    fieldValue !== undefined &&
    typeof fieldValue === 'string'
  );
}

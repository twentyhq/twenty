import { FieldNumberValue } from '../FieldMetadata';

// TODO: add yup
export function isFieldNumberValue(
  fieldValue: unknown,
): fieldValue is FieldNumberValue {
  return (
    fieldValue === null ||
    (fieldValue !== undefined && typeof fieldValue === 'number')
  );
}

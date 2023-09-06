import { FieldDateValue } from '../FieldMetadata';

// TODO: add yup
export function isFieldDateValue(
  fieldValue: unknown,
): fieldValue is FieldDateValue {
  return (
    fieldValue === null ||
    (fieldValue !== undefined && typeof fieldValue === 'string')
  );
}

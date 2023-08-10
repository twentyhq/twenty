import { FieldRelationValue } from '../FieldMetadata';

// TODO: add yup
export function isFieldRelationValue(
  fieldValue: unknown,
): fieldValue is FieldRelationValue {
  return (
    fieldValue !== null &&
    fieldValue !== undefined &&
    typeof fieldValue === 'object'
  );
}

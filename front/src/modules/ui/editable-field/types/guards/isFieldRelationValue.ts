import { FieldRelationValue } from '../FieldMetadata';

// TODO: add yup
export function isFieldRelationValue(
  fieldValue: unknown,
): fieldValue is FieldRelationValue {
  return fieldValue !== undefined && typeof fieldValue === 'object';
}

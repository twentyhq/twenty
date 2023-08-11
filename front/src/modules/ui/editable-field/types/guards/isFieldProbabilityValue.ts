import { FieldProbabilityValue } from '../FieldMetadata';

// TODO: add yup
export function isFieldProbabilityValue(
  fieldValue: unknown,
): fieldValue is FieldProbabilityValue {
  return (
    fieldValue !== null &&
    fieldValue !== undefined &&
    typeof fieldValue === 'number'
  );
}

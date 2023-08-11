import { ViewFieldProbabilityValue } from '../ViewField';

// TODO: add yup
export function isViewFieldProbabilityValue(
  fieldValue: unknown,
): fieldValue is ViewFieldProbabilityValue {
  return (
    fieldValue !== null &&
    fieldValue !== undefined &&
    typeof fieldValue === 'number'
  );
}

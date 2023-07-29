import { ViewFieldDoubleTextChipValue } from '../ViewField';

// TODO: add yup
export function isViewFieldDoubleTextChipValue(
  fieldValue: unknown,
): fieldValue is ViewFieldDoubleTextChipValue {
  return (
    fieldValue !== null &&
    fieldValue !== undefined &&
    typeof fieldValue === 'object'
  );
}

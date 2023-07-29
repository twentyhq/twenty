import { ViewFieldDoubleTextValue } from '../ViewField';

// TODO: add yup
export function isViewFieldDoubleTextValue(
  fieldValue: unknown,
): fieldValue is ViewFieldDoubleTextValue {
  return (
    fieldValue !== null &&
    fieldValue !== undefined &&
    typeof fieldValue === 'object'
  );
}

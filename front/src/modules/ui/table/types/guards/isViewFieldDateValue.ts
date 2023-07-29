import { ViewFieldDateValue } from '../ViewField';

// TODO: add yup
export function isViewFieldDateValue(
  fieldValue: unknown,
): fieldValue is ViewFieldDateValue {
  return (
    fieldValue !== null &&
    fieldValue !== undefined &&
    typeof fieldValue === 'string'
  );
}

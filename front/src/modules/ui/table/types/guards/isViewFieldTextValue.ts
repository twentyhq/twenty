import { ViewFieldTextValue } from '../ViewField';

// TODO: add yup
export function isViewFieldTextValue(
  fieldValue: unknown,
): fieldValue is ViewFieldTextValue {
  return (
    fieldValue !== null &&
    fieldValue !== undefined &&
    typeof fieldValue === 'string'
  );
}

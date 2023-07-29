import { ViewFieldURLValue } from '../ViewField';

// TODO: add yup
export function isViewFieldURLValue(
  fieldValue: unknown,
): fieldValue is ViewFieldURLValue {
  return (
    fieldValue !== null &&
    fieldValue !== undefined &&
    typeof fieldValue === 'string'
  );
}

import { ViewFieldEmailValue } from '../ViewField';

export function isViewFieldEmailValue(
  fieldValue: unknown,
): fieldValue is ViewFieldEmailValue {
  return (
    fieldValue !== null &&
    fieldValue !== undefined &&
    typeof fieldValue === 'string'
  );
}

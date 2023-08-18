import { ViewFieldBooleanValue } from '../ViewField';

export function isViewFieldBooleanValue(
  fieldValue: unknown,
): fieldValue is ViewFieldBooleanValue {
  return (
    fieldValue !== null &&
    fieldValue !== undefined &&
    typeof fieldValue === 'boolean'
  );
}

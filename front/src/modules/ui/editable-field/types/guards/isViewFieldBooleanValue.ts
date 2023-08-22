import { ViewFieldBooleanValue } from '../ViewField';

export function isViewFieldBooleanValue(
  fieldValue: unknown,
): fieldValue is ViewFieldBooleanValue {
  return typeof fieldValue === 'boolean';
}

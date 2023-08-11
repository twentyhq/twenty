import { ViewFieldPhoneValue } from '../ViewField';

// TODO: add yup
export function isViewFieldPhoneValue(
  fieldValue: unknown,
): fieldValue is ViewFieldPhoneValue {
  return (
    fieldValue !== null &&
    fieldValue !== undefined &&
    typeof fieldValue === 'string'
  );
}

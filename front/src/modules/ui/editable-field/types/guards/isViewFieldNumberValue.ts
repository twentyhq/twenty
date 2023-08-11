import { ViewFieldNumberValue } from '../ViewField';

// TODO: add yup
export function isViewFieldNumberValue(
  fieldValue: unknown,
): fieldValue is ViewFieldNumberValue {
  console.log(fieldValue);

  return (
    fieldValue !== null &&
    fieldValue !== undefined &&
    typeof fieldValue === 'number'
  );
}

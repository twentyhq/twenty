import { ViewFieldChipValue } from '../ViewField';

// TODO: add yup
export function isViewFieldChipValue(
  fieldValue: unknown,
): fieldValue is ViewFieldChipValue {
  return (
    fieldValue !== null &&
    fieldValue !== undefined &&
    typeof fieldValue === 'string'
  );
}

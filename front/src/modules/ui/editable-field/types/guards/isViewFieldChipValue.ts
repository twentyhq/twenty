import { ViewFieldChipValue } from '../ViewField';

// TODO: add yup
export const isViewFieldChipValue = (
  fieldValue: unknown,
): fieldValue is ViewFieldChipValue =>
  fieldValue !== null &&
  fieldValue !== undefined &&
  typeof fieldValue === 'string';

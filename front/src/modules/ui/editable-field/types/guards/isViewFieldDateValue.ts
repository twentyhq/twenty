import { ViewFieldDateValue } from '../ViewField';

// TODO: add yup
export const isViewFieldDateValue = (
  fieldValue: unknown,
): fieldValue is ViewFieldDateValue =>
  fieldValue !== null &&
  fieldValue !== undefined &&
  typeof fieldValue === 'string';

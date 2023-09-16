import { ViewFieldTextValue } from '../ViewField';

// TODO: add yup
export const isViewFieldTextValue = (
  fieldValue: unknown,
): fieldValue is ViewFieldTextValue =>
  fieldValue !== null &&
  fieldValue !== undefined &&
  typeof fieldValue === 'string';

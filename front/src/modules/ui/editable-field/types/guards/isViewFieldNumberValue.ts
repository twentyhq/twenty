import { ViewFieldNumberValue } from '../ViewField';

// TODO: add yup
export const isViewFieldNumberValue = (
  fieldValue: unknown,
): fieldValue is ViewFieldNumberValue =>
  fieldValue !== null &&
  fieldValue !== undefined &&
  typeof fieldValue === 'number';

import { ViewFieldURLValue } from '../ViewField';

// TODO: add yup
export const isViewFieldURLValue = (
  fieldValue: unknown,
): fieldValue is ViewFieldURLValue =>
  fieldValue !== null &&
  fieldValue !== undefined &&
  typeof fieldValue === 'string';

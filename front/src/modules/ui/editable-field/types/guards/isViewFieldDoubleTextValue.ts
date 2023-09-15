import { ViewFieldDoubleTextValue } from '../ViewField';

// TODO: add yup
export const isViewFieldDoubleTextValue = (
  fieldValue: unknown,
): fieldValue is ViewFieldDoubleTextValue =>
  fieldValue !== null &&
  fieldValue !== undefined &&
  typeof fieldValue === 'object';

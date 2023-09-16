import { ViewFieldDoubleTextChipValue } from '../ViewField';

// TODO: add yup
export const isViewFieldDoubleTextChipValue = (
  fieldValue: unknown,
): fieldValue is ViewFieldDoubleTextChipValue =>
  fieldValue !== null &&
  fieldValue !== undefined &&
  typeof fieldValue === 'object';

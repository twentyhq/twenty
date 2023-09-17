import { ViewFieldProbabilityValue } from '../ViewField';

// TODO: add yup
export const isViewFieldProbabilityValue = (
  fieldValue: unknown,
): fieldValue is ViewFieldProbabilityValue =>
  fieldValue !== null &&
  fieldValue !== undefined &&
  typeof fieldValue === 'number';

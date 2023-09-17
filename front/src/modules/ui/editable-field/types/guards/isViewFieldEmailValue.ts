import { ViewFieldEmailValue } from '../ViewField';

export const isViewFieldEmailValue = (
  fieldValue: unknown,
): fieldValue is ViewFieldEmailValue =>
  fieldValue !== null &&
  fieldValue !== undefined &&
  typeof fieldValue === 'string';

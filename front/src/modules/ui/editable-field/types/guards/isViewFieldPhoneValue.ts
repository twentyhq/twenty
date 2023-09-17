import { ViewFieldPhoneValue } from '../ViewField';

// TODO: add yup
export const isViewFieldPhoneValue = (
  fieldValue: unknown,
): fieldValue is ViewFieldPhoneValue =>
  fieldValue !== null &&
  fieldValue !== undefined &&
  typeof fieldValue === 'string';

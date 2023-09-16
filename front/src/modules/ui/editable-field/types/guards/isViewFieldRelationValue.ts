import { ViewFieldRelationValue } from '../ViewField';

// TODO: add yup
export const isViewFieldRelationValue = (
  fieldValue: unknown,
): fieldValue is ViewFieldRelationValue =>
  fieldValue !== undefined && typeof fieldValue === 'object';

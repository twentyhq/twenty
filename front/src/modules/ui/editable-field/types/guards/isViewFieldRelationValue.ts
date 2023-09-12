import { ViewFieldRelationValue } from '../ViewField';

// TODO: add yup
export function isViewFieldRelationValue(
  fieldValue: unknown,
): fieldValue is ViewFieldRelationValue {
  return fieldValue !== undefined && typeof fieldValue === 'object';
}

import { FieldRelationValue } from '../FieldMetadata';

// TODO: add yup
export const isFieldRelationValue = (
  fieldValue: unknown,
): fieldValue is FieldRelationValue =>
  fieldValue !== undefined && typeof fieldValue === 'object';

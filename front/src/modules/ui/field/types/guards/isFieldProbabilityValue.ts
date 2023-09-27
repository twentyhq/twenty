import { FieldProbabilityValue } from '../FieldMetadata';

// TODO: add yup
export const isFieldProbabilityValue = (
  fieldValue: unknown,
): fieldValue is FieldProbabilityValue =>
  fieldValue !== null &&
  fieldValue !== undefined &&
  typeof fieldValue === 'number';

import { FieldDoubleTextValue } from '../FieldMetadata';
import { DoubleTextTypeResolver } from '../resolvers/DoubleTextTypeResolver';

// TODO: add yup
export const isFieldDoubleTextValue = (
  fieldValue: unknown,
): fieldValue is FieldDoubleTextValue =>
  fieldValue !== null &&
  fieldValue !== undefined &&
  DoubleTextTypeResolver.safeParse(fieldValue).success;

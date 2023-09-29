import { FieldDoubleTextChipValue } from '../FieldMetadata';
import { DoubleTextTypeResolver } from '../resolvers/DoubleTextTypeResolver';

export const isFieldDoubleTextChipValue = (
  fieldValue: unknown,
): fieldValue is FieldDoubleTextChipValue =>
  fieldValue !== null &&
  fieldValue !== undefined &&
  DoubleTextTypeResolver.safeParse(fieldValue).success;

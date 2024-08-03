import { isNumber } from '@sniptt/guards';
import { FieldPositionMetadata } from '../FieldMetadata';

// TODO: add zod
export const isFieldPhoneValue = (
  fieldValue: unknown,
): fieldValue is FieldPositionMetadata =>
  isNumber(fieldValue) || fieldValue === 'first' || fieldValue === 'last';

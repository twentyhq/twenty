import { isNumber } from '@sniptt/guards';
import { type FieldPositionMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';

// TODO: add zod
export const isFieldPhoneValue = (
  fieldValue: unknown,
): fieldValue is FieldPositionMetadata =>
  isNumber(fieldValue) || fieldValue === 'first' || fieldValue === 'last';

import { FieldJsonValue } from '@/object-record/record-field/types/FieldMetadata';
import { z } from 'zod';

export const isFieldFieldPathValue = (
  fieldValue: unknown,
): fieldValue is FieldJsonValue =>
  z.array(z.string()).nullable().safeParse(fieldValue).success;

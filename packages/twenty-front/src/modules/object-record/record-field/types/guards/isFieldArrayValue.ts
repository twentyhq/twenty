import { FieldArrayValue } from '@/object-record/record-field/types/FieldMetadata';
import { z } from 'zod';

export const arraySchema = z.union([z.null(), z.array(z.string())]);

export const isFieldArrayValue = (
  fieldValue: unknown,
): fieldValue is FieldArrayValue => arraySchema.safeParse(fieldValue).success;

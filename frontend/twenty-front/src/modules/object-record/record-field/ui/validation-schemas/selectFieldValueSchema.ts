import { z } from 'zod';

import { type FieldSelectValue } from '@/object-record/record-field/ui/types/FieldMetadata';

export const selectFieldValueSchema = (
  options?: string[],
): z.ZodType<FieldSelectValue> =>
  options?.length
    ? z.enum(options as [string, ...string[]]).nullable()
    : z.string().nullable();

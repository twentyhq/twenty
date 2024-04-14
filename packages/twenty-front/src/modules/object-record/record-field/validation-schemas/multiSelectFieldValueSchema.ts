import { z } from 'zod';

import { FieldMultiSelectValue } from '@/object-record/record-field/types/FieldMetadata';

export const multiSelectFieldValueSchema = (
  options?: string[],
): z.ZodType<FieldMultiSelectValue> =>
  options?.length
    ? z.array(z.enum(options as [string, ...string[]])).nullable()
    : z.array(z.string()).nullable();

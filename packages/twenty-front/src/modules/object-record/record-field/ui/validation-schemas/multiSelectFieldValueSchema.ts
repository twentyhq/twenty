import { z } from 'zod';

import { type FieldMultiSelectValue } from '@/object-record/record-field/ui/types/FieldMetadata';

export const multiSelectFieldValueSchema = (
  options?: string[],
): z.ZodType<FieldMultiSelectValue> =>
  options?.length
    ? z.array(z.enum(options as [string, ...string[]])).nullable()
    : z.array(z.string()).nullable();

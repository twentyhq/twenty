import { ViewFilterOperand } from 'twenty-shared/types';
import z from 'zod';

export const urlSingleFilterSchema = z.object({
  field: z.string(),
  op: z.enum(ViewFilterOperand),
  value: z.string(),
  subField: z.string().optional(),
});

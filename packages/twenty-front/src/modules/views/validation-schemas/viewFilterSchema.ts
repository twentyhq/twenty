import { ViewFilter } from '@/views/types/ViewFilter';
import { z } from 'zod';

export const viewFilterSchema = z
  .object({
    id: z.string().uuid(),
    fieldMetadataId: z.string().uuid(),
    operand: z.string(),
    value: z.string(),
    displayValue: z.string(),
    viewId: z.string().uuid().nullish(),
    viewFilterGroupId: z.string().uuid().nullish(),
    positionInViewFilterGroup: z.number().nullish(),
  })
  .passthrough() as unknown as z.ZodType<ViewFilter>;

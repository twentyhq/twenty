import { z } from 'zod';

export const firefliesBackfillBatchPayloadSchema = z.object({
  transcriptIds: z.array(z.string().min(1)).min(1),
});

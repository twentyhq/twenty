import { z } from 'zod';

import { FIREFLIES_BACKFILL_BATCH_SIZE } from 'src/logic-functions/constants/fireflies-backfill-batch-size.constant';

export const firefliesBackfillBatchPayloadSchema = z.object({
  connectionId: z.string().min(1),
  transcriptIds: z
    .array(z.string().min(1))
    .min(1)
    .max(FIREFLIES_BACKFILL_BATCH_SIZE),
});

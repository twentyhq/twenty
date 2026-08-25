import { z } from 'zod';

import { firefliesBackfillRequestBodySchema } from 'src/logic-functions/schemas/fireflies-backfill-request-body.schema';

export const firefliesBackfillWorkerPayloadSchema =
  firefliesBackfillRequestBodySchema.extend({
    connectionId: z.string().min(1),
  });

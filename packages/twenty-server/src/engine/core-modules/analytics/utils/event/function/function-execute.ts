import { z } from 'zod';

import { eventSchema } from 'src/engine/core-modules/analytics/utils/event/common/base-schemas';

export const functionExecuteSchema = eventSchema.extend({
  action: z.literal('function.execute'),
  payload: z
    .object({
      duration: z.number(),
      status: z.enum(['SUCCESS', 'ERROR']),
      errorType: z.string().optional(),
      functionId: z.string(),
      functionName: z.string(),
    })
    .strict(),
});

import { z } from 'zod';

import { baseEventSchema } from 'src/engine/core-modules/analytics/utils/events/common/base-schemas';

export const functionExecuteSchema = baseEventSchema.extend({
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

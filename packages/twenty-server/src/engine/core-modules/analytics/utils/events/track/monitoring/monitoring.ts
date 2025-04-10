import { z } from 'zod';

import { baseEventSchema } from 'src/engine/core-modules/analytics/utils/events/common/base-schemas';

export const serverlessFunctionExecutedSchema = baseEventSchema.extend({
  action: z.literal('serverlessFunction.executed'),
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

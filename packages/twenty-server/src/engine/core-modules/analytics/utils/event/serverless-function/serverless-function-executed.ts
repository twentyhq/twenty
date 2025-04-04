import { z } from 'zod';

import { eventSchema } from 'src/engine/core-modules/analytics/utils/event/common/base-schemas';

export const serverlessFunctionExecutedSchema = eventSchema.extend({
  action: z.literal('serverlessFunction.executed'),
  payload: z
    .object({
      duration: z.number(),
      status: z.enum(['IDLE', 'SUCCESS', 'ERROR']),
      errorType: z.string().optional(),
      functionId: z.string(),
      functionName: z.string(),
    })
    .strict(),
});

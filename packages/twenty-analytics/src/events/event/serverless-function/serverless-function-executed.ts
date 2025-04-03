import { z } from 'zod';
import { eventSchema } from '../common/base-schemas';

export const serverlessFunctionExecutedSchema = eventSchema.extend({
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

import { z } from 'zod';

import { registerEvent } from 'src/engine/core-modules/analytics/utils/events/track/track';

export const SERVERLESS_FUNCTION_EXECUTED_EVENT =
  'Serverless Function Executed' as const;
export const serverlessFunctionExecutedSchema = z
  .object({
    event: z.literal(SERVERLESS_FUNCTION_EXECUTED_EVENT),
    properties: z
      .object({
        duration: z.number(),
        status: z.enum(['IDLE', 'SUCCESS', 'ERROR']),
        errorType: z.string().optional(),
        functionId: z.string(),
        functionName: z.string(),
      })
      .strict(),
  })
  .strict();

export type ServerlessFunctionExecutedTrackEvent = z.infer<
  typeof serverlessFunctionExecutedSchema
>;

registerEvent(
  SERVERLESS_FUNCTION_EXECUTED_EVENT,
  serverlessFunctionExecutedSchema,
);

import { z } from 'zod';

import { registerEvent } from 'src/engine/core-modules/audit/utils/events/workspace-event/track';

export const SERVERLESS_FUNCTION_EXECUTED_EVENT =
  'Serverless Function Executed' as const;
export const serverlessFunctionExecutedSchema = z.strictObject({
  event: z.literal(SERVERLESS_FUNCTION_EXECUTED_EVENT),
  properties: z.strictObject({
    duration: z.number(),
    status: z.enum(['IDLE', 'SUCCESS', 'ERROR']),
    errorType: z.string().optional(),
    functionId: z.string(),
    functionName: z.string(),
  }),
});

export type ServerlessFunctionExecutedTrackEvent = z.infer<
  typeof serverlessFunctionExecutedSchema
>;

registerEvent(
  SERVERLESS_FUNCTION_EXECUTED_EVENT,
  serverlessFunctionExecutedSchema,
);

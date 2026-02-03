import { z } from 'zod';

import { registerEvent } from 'src/engine/core-modules/audit/utils/events/workspace-event/track';

export const LOGIC_FUNCTION_EXECUTED_EVENT = 'Logic Function Executed' as const;
export const logicFunctionExecutedSchema = z.strictObject({
  event: z.literal(LOGIC_FUNCTION_EXECUTED_EVENT),
  properties: z.strictObject({
    duration: z.number(),
    status: z.enum(['IDLE', 'SUCCESS', 'ERROR']),
    errorType: z.string().optional(),
    functionId: z.string(),
    functionName: z.string(),
  }),
});

export type LogicFunctionExecutedTrackEvent = z.infer<
  typeof logicFunctionExecutedSchema
>;

registerEvent(LOGIC_FUNCTION_EXECUTED_EVENT, logicFunctionExecutedSchema);

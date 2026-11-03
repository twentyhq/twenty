import { type AgentTrigger } from 'twenty-shared/application';
import { z } from 'zod';

const baseShape = {
  id: z.uuid(),
  isActive: z.boolean(),
  instructions: z.string().nullable(),
};

const editableTriggerSchema = z.discriminatedUnion('type', [
  z.object({
    ...baseShape,
    type: z.literal('DATABASE_EVENT'),
    settings: z.object({
      eventName: z.string(),
      updatedFields: z.array(z.string()).optional(),
      batchMode: z.boolean().optional(),
    }),
  }),
  z.object({
    ...baseShape,
    type: z.literal('CRON'),
    settings: z.object({ pattern: z.string() }),
  }),
]);

export const getCoreAgentEditableTrigger = (
  trigger: unknown,
): AgentTrigger | undefined => {
  const result = editableTriggerSchema.safeParse(trigger);

  return result.success ? result.data : undefined;
};

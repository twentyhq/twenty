import { coreAgentTriggerSchema } from '@/object-core/agents/validation-schemas/coreAgentTriggerSchema';
import { z } from 'zod';

const editableTriggerSchema = z.discriminatedUnion('type', [
  coreAgentTriggerSchema.options[0].extend({
    instructions: z.string().nullable(),
  }),
  coreAgentTriggerSchema.options[1].extend({
    instructions: z.string().nullable(),
    settings: z.object({ pattern: z.string() }),
  }),
]);

export const getCoreAgentEditableTrigger = (trigger: unknown) => {
  const result = editableTriggerSchema.safeParse(trigger);
  return result.success ? result.data : undefined;
};

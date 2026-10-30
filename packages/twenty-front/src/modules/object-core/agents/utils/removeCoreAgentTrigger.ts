import { coreAgentTriggerSchema } from '@/object-core/agents/validation-schemas/coreAgentTriggerSchema';

export const removeCoreAgentTrigger = ({
  triggers,
  triggerId,
}: {
  triggers: unknown[];
  triggerId: string;
}): unknown[] =>
  triggers.filter((trigger) => {
    const parsedTrigger = coreAgentTriggerSchema.safeParse(trigger);

    return !parsedTrigger.success || parsedTrigger.data.id !== triggerId;
  });

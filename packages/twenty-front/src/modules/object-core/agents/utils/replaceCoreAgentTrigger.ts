import { type AgentTrigger } from 'twenty-shared/application';

import { coreAgentTriggerSchema } from '@/object-core/agents/validation-schemas/coreAgentTriggerSchema';

export const replaceCoreAgentTrigger = ({
  triggers,
  nextTrigger,
}: {
  triggers: unknown[];
  nextTrigger: AgentTrigger;
}): unknown[] =>
  triggers.map((trigger) => {
    const parsedTrigger = coreAgentTriggerSchema.safeParse(trigger);

    return parsedTrigger.success && parsedTrigger.data.id === nextTrigger.id
      ? nextTrigger
      : trigger;
  });

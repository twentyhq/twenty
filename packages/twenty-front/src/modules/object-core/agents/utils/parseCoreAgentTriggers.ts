import { type AgentTrigger } from 'twenty-shared/application';

import { coreAgentTriggerSchema } from '@/object-core/agents/validation-schemas/coreAgentTriggerSchema';

export const parseCoreAgentTriggers = (triggers: unknown[]): AgentTrigger[] =>
  triggers.flatMap((trigger) => {
    const parsedTrigger = coreAgentTriggerSchema.safeParse(trigger);

    return parsedTrigger.success ? [parsedTrigger.data] : [];
  });

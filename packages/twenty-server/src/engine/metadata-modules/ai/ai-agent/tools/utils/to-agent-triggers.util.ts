import { type AgentTrigger } from 'twenty-shared/application';
import { v4 } from 'uuid';

import { type AgentTriggerInput } from 'src/engine/metadata-modules/ai/ai-agent/tools/schemas/agent-trigger.schema';

export const toAgentTriggers = (
  triggerInputs: AgentTriggerInput[],
): AgentTrigger[] =>
  triggerInputs.map(({ id, isActive, instructions, ...trigger }) => ({
    ...trigger,
    id: id ?? v4(),
    isActive: isActive ?? true,
    instructions: instructions ?? null,
  }));

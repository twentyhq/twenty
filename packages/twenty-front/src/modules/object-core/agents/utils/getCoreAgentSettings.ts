import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { type CoreAgentSettings } from '@/object-core/agents/types/CoreAgentSettings';

export const getCoreAgentSettings = (agent: CoreAgent): CoreAgentSettings => ({
  description: agent.description,
  prompt: agent.prompt,
  modelId: agent.modelId,
  modelConfiguration: agent.modelConfiguration ?? {},
  triggers: agent.triggers ?? [],
});

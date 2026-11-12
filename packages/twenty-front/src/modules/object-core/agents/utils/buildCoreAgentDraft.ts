import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { type CoreAgentDraft } from '@/object-core/agents/types/CoreAgentDraft';
import { getCoreAgentInitialFormValues } from '@/object-core/agents/utils/getCoreAgentInitialFormValues';

export const buildCoreAgentDraft = (agent: CoreAgent): CoreAgentDraft => ({
  ...getCoreAgentInitialFormValues(agent),
  triggers: agent.triggers,
});

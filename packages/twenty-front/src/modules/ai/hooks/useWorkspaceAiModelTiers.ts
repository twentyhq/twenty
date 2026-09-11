import {
  DEFAULT_AI_AGENT_MODEL_TIER,
  DEFAULT_AI_CHAT_MODEL_TIER,
  type AiModelTier,
} from 'twenty-shared/ai';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

// The defaults only cover the moment before the workspace has loaded.
export const useWorkspaceAiModelTiers = (): {
  chatTier: AiModelTier;
  agentTier: AiModelTier;
} => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  return {
    chatTier: currentWorkspace?.aiChatModelTier ?? DEFAULT_AI_CHAT_MODEL_TIER,
    agentTier:
      currentWorkspace?.aiAgentModelTier ?? DEFAULT_AI_AGENT_MODEL_TIER,
  };
};

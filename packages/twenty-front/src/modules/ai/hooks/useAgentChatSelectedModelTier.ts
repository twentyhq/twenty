import { type AiModelTier } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { useIsWorkspaceSetupChat } from '@/ai/hooks/useIsWorkspaceSetupChat';
import { useWorkspaceAiModelTiers } from '@/ai/hooks/useWorkspaceAiModelTiers';
import { agentChatUserSelectedModelTierState } from '@/ai/states/agentChatUserSelectedModelTierState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useAgentChatSelectedModelTier = (): {
  selectedTier: AiModelTier;
  workspaceTier: AiModelTier;
  isFollowingWorkspaceTier: boolean;
} => {
  const { chatTier } = useWorkspaceAiModelTiers();
  const isWorkspaceSetupChat = useIsWorkspaceSetupChat();
  const agentChatUserSelectedModelTier = useAtomStateValue(
    agentChatUserSelectedModelTierState,
  );

  // The setup chat always runs on the fast tier server-side.
  const workspaceTier: AiModelTier = isWorkspaceSetupChat ? 'fast' : chatTier;

  return {
    selectedTier: agentChatUserSelectedModelTier ?? workspaceTier,
    workspaceTier,
    // Only a send without a model id follows the workspace tier, and the setup chat always sends the fast tier
    isFollowingWorkspaceTier:
      !isDefined(agentChatUserSelectedModelTier) && !isWorkspaceSetupChat,
  };
};

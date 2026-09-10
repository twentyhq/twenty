import { AUTO_SELECT_MODEL_ID_BY_TIER, isAiModelTier } from 'twenty-shared/ai';
import { AUTO_SELECT_FAST_MODEL_ID } from 'twenty-shared/constants';

import { agentChatUserSelectedModelTierState } from '@/ai/states/agentChatUserSelectedModelTierState';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

// An undefined request id lets the server fall back to the workspace chat
// tier, so the client never has to know that setting to send a message.
export const useAgentChatModelId = () => {
  const agentChatUserSelectedModelTier = useAtomStateValue(
    agentChatUserSelectedModelTierState,
  );
  // The value comes from localStorage, so a stale tier name must not reach
  // the request.
  const selectedTier = isAiModelTier(agentChatUserSelectedModelTier)
    ? agentChatUserSelectedModelTier
    : null;
  // The shared sender mounts above the chat surface providers.
  const shouldOpenAiChatAfterOnboarding = useAtomStateValue(
    shouldOpenAiChatAfterOnboardingState,
  );

  const workspaceSetupModelId = shouldOpenAiChatAfterOnboarding
    ? AUTO_SELECT_FAST_MODEL_ID
    : undefined;

  const modelIdForRequest =
    selectedTier !== null
      ? AUTO_SELECT_MODEL_ID_BY_TIER[selectedTier]
      : workspaceSetupModelId;

  return { selectedTier, modelIdForRequest };
};

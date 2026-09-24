import { AUTO_SELECT_MODEL_ID_BY_TIER } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { agentChatUserSelectedModelTierState } from '@/ai/states/agentChatUserSelectedModelTierState';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

// An undefined request id lets the server fall back to the workspace chat
// tier, so the client never has to know that setting to send a message.
export const useAgentChatModelId = () => {
  const agentChatUserSelectedModelTier = useAtomStateValue(
    agentChatUserSelectedModelTierState,
  );
  // The shared sender mounts above the chat surface providers.
  const shouldOpenAiChatAfterOnboarding = useAtomStateValue(
    shouldOpenAiChatAfterOnboardingState,
  );

  const workspaceSetupModelId = shouldOpenAiChatAfterOnboarding
    ? AUTO_SELECT_MODEL_ID_BY_TIER.fast
    : undefined;

  const modelIdForRequest = isDefined(agentChatUserSelectedModelTier)
    ? AUTO_SELECT_MODEL_ID_BY_TIER[agentChatUserSelectedModelTier]
    : workspaceSetupModelId;

  return { modelIdForRequest };
};

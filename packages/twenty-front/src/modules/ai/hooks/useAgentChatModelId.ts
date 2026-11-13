import { AUTO_SELECT_MODEL_ID_BY_TIER } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { agentChatUserSelectedModelTierState } from '@/ai/states/agentChatUserSelectedModelTierState';
import { shouldOpenInboxAfterOnboardingState } from '@/onboarding/states/shouldOpenInboxAfterOnboardingState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

// undefined lets the server fall back to the workspace chat tier.
export const useAgentChatModelId = () => {
  const agentChatUserSelectedModelTier = useAtomStateValue(
    agentChatUserSelectedModelTierState,
  );
  // The shared sender mounts above the chat surface providers.
  const shouldOpenInboxAfterOnboarding = useAtomStateValue(
    shouldOpenInboxAfterOnboardingState,
  );

  const workspaceSetupModelId = shouldOpenInboxAfterOnboarding
    ? AUTO_SELECT_MODEL_ID_BY_TIER.fast
    : undefined;

  const modelIdForRequest = isDefined(agentChatUserSelectedModelTier)
    ? AUTO_SELECT_MODEL_ID_BY_TIER[agentChatUserSelectedModelTier]
    : workspaceSetupModelId;

  return { modelIdForRequest };
};

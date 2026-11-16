import { AUTO_SELECT_MODEL_ID_BY_TIER } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { aiChatUserSelectedModelTierState } from '@/ai/states/aiChatUserSelectedModelTierState';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

// undefined lets the server fall back to the workspace chat tier.
export const useAiChatModelId = () => {
  const aiChatUserSelectedModelTier = useAtomStateValue(
    aiChatUserSelectedModelTierState,
  );
  // The shared sender mounts above the chat surface providers.
  const shouldOpenAiChatAfterOnboarding = useAtomStateValue(
    shouldOpenAiChatAfterOnboardingState,
  );

  const workspaceSetupModelId = shouldOpenAiChatAfterOnboarding
    ? AUTO_SELECT_MODEL_ID_BY_TIER.fast
    : undefined;

  const modelIdForRequest = isDefined(aiChatUserSelectedModelTier)
    ? AUTO_SELECT_MODEL_ID_BY_TIER[aiChatUserSelectedModelTier]
    : workspaceSetupModelId;

  return { modelIdForRequest };
};

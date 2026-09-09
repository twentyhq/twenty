import { isAutoSelectModelId, isDefined } from 'twenty-shared/utils';

import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { useWorkspaceAiModelAvailability } from '@/ai/hooks/useWorkspaceAiModelAvailability';
import { agentChatUserSelectedModelState } from '@/ai/states/agentChatUserSelectedModelState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useAgentChatModelId = () => {
  const { enabledModels } = useWorkspaceAiModelAvailability();
  const agentChatUserSelectedModel = useAtomStateValue(
    agentChatUserSelectedModelState,
  );
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  // The shared sender mounts above the chat surface providers.
  const shouldOpenAiChatAfterOnboarding = useAtomStateValue(
    shouldOpenAiChatAfterOnboardingState,
  );

  const isUserModelAvailable =
    !isDefined(agentChatUserSelectedModel) ||
    isAutoSelectModelId(agentChatUserSelectedModel) ||
    enabledModels.some((model) => model.modelId === agentChatUserSelectedModel);

  const selectedModelId = isUserModelAvailable
    ? agentChatUserSelectedModel
    : null;

  const workspaceSetupModelId = shouldOpenAiChatAfterOnboarding
    ? currentWorkspace?.fastModel
    : null;

  const modelIdForRequest =
    selectedModelId ?? workspaceSetupModelId ?? undefined;

  return { selectedModelId, modelIdForRequest };
};

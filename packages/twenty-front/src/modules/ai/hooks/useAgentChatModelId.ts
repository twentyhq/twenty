import { isAutoSelectModelId, isDefined } from 'twenty-shared/utils';

import { useIsWorkspaceSetupChat } from '@/ai/hooks/useIsWorkspaceSetupChat';
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
  const isWorkspaceSetupChat = useIsWorkspaceSetupChat();

  // Auto-select sentinel ids ("default-fast-model" / "default-smart-model")
  // are resolved server-side by the model registry and are deliberately absent
  // from the enabled-models list — treat them as always available, or a FAST
  // preselection silently degrades to the server default (the smart model)
  // for every workspace whose fastModel is the default sentinel.
  const isUserModelAvailable =
    !isDefined(agentChatUserSelectedModel) ||
    isAutoSelectModelId(agentChatUserSelectedModel) ||
    enabledModels.some((model) => model.modelId === agentChatUserSelectedModel);

  const selectedModelId = isUserModelAvailable
    ? agentChatUserSelectedModel
    : null;

  const workspaceSetupModelId = isWorkspaceSetupChat
    ? currentWorkspace?.fastModel
    : null;

  const modelIdForRequest =
    selectedModelId ?? workspaceSetupModelId ?? undefined;

  return { selectedModelId, modelIdForRequest };
};

import { isDefined } from 'twenty-shared/utils';

import { useWorkspaceAiModelAvailability } from '@/ai/hooks/useWorkspaceAiModelAvailability';
import { agentChatUserSelectedModelState } from '@/ai/states/agentChatUserSelectedModelState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useAgentChatModelId = () => {
  const { enabledModels } = useWorkspaceAiModelAvailability();
  const agentChatUserSelectedModel = useAtomStateValue(
    agentChatUserSelectedModelState,
  );

  const isUserModelAvailable =
    !isDefined(agentChatUserSelectedModel) ||
    enabledModels.some((model) => model.modelId === agentChatUserSelectedModel);

  const selectedModelId = isUserModelAvailable
    ? agentChatUserSelectedModel
    : null;
  const modelIdForRequest = selectedModelId ?? undefined;

  return { selectedModelId, modelIdForRequest };
};

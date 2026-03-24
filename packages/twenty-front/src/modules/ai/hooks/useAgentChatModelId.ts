import { isDefined } from 'twenty-shared/utils';

import { useWorkspaceAiModelAvailability } from '@/ai/hooks/useWorkspaceAiModelAvailability';
import { agentChatUserSelectedModelState } from '@/ai/states/agentChatUserSelectedModelState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useAgentChatModelId = () => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const { enabledModels } = useWorkspaceAiModelAvailability();
  const agentChatUserSelectedModel = useAtomStateValue(
    agentChatUserSelectedModelState,
  );

  const isUserModelAvailable =
    isDefined(agentChatUserSelectedModel) &&
    enabledModels.some(
      (model) => model.modelId === agentChatUserSelectedModel,
    );

  const resolvedModelId = isUserModelAvailable
    ? agentChatUserSelectedModel
    : currentWorkspace?.smartModel;

  return { resolvedModelId };
};

import { useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

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
  const { pathname } = useLocation();

  const isUserModelAvailable =
    !isDefined(agentChatUserSelectedModel) ||
    enabledModels.some((model) => model.modelId === agentChatUserSelectedModel);

  const selectedModelId = isUserModelAvailable
    ? agentChatUserSelectedModel
    : null;

  const workspaceSetupModelId =
    pathname === AppPath.WorkspaceSetup ? currentWorkspace?.fastModel : null;

  const modelIdForRequest =
    selectedModelId ?? workspaceSetupModelId ?? undefined;

  return { selectedModelId, modelIdForRequest };
};

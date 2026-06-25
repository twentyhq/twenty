import { isAutoSelectModelId } from 'twenty-shared/utils';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useWorkspaceAiModelAvailability = () => {
  const aiModels = useAtomStateValue(aiModelsState);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const useRecommendedModels = currentWorkspace?.useRecommendedModels ?? true;
  const enabledAiModelIds = new Set(currentWorkspace?.enabledAiModelIds ?? []);

  const realModels = aiModels.filter(
    (model) => !isAutoSelectModelId(model.modelId) && !model.isDeprecated,
  );

  const enabledModels = useRecommendedModels
    ? realModels.filter((model) => model.isRecommended === true)
    : realModels.filter((model) => enabledAiModelIds.has(model.modelId));

  return {
    enabledModels,
    realModels,
    useRecommendedModels,
  };
};

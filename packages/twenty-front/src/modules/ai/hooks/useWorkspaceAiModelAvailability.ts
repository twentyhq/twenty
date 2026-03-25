import { isAutoSelectModelId } from 'twenty-shared/utils';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type ClientAiModelConfig } from '~/generated-metadata/graphql';

export const useWorkspaceAiModelAvailability = () => {
  const aiModels = useAtomStateValue(aiModelsState);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const useRecommendedModels = currentWorkspace?.useRecommendedModels ?? true;
  const enabledAiModelIds = currentWorkspace?.enabledAiModelIds ?? [];

  const isModelEnabled = (
    modelId: string,
    model?: ClientAiModelConfig,
  ): boolean => {
    if (isAutoSelectModelId(modelId)) {
      return true;
    }

    if (useRecommendedModels) {
      return model?.isRecommended === true;
    }

    return enabledAiModelIds.includes(modelId);
  };

  const realModels = aiModels.filter(
    (model) => !isAutoSelectModelId(model.modelId) && !model.isDeprecated,
  );

  const enabledModels = realModels.filter((model) =>
    isModelEnabled(model.modelId, model),
  );

  const allModelsWithAvailability = realModels.map((model) => ({
    ...model,
    isEnabled: isModelEnabled(model.modelId, model),
  }));

  return {
    isModelEnabled,
    enabledModels,
    realModels,
    allModelsWithAvailability,
    useRecommendedModels,
    enabledAiModelIds,
  };
};

import { DEFAULT_FAST_MODEL } from '@/ai/constants/DefaultFastModel';
import { DEFAULT_SMART_MODEL } from '@/ai/constants/DefaultSmartModel';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { type ClientAiModelConfig } from '~/generated-metadata/graphql';

const VIRTUAL_MODEL_IDS: Set<string> = new Set([
  DEFAULT_SMART_MODEL,
  DEFAULT_FAST_MODEL,
]);

const isVirtualModel = (modelId: string) => VIRTUAL_MODEL_IDS.has(modelId);

export const useWorkspaceAiModelAvailability = () => {
  const aiModels = useRecoilValueV2(aiModelsState);
  const currentWorkspace = useRecoilValueV2(currentWorkspaceState);

  const useRecommendedModels = currentWorkspace?.useRecommendedModels ?? true;
  const autoEnableNewAiModels = currentWorkspace?.autoEnableNewAiModels ?? true;
  const disabledAiModelIds = currentWorkspace?.disabledAiModelIds ?? [];
  const enabledAiModelIds = currentWorkspace?.enabledAiModelIds ?? [];

  const isModelEnabled = (
    modelId: string,
    model?: ClientAiModelConfig,
  ): boolean => {
    if (isVirtualModel(modelId)) {
      return true;
    }

    if (useRecommendedModels) {
      return model?.isRecommended === true;
    }

    return autoEnableNewAiModels
      ? !disabledAiModelIds.includes(modelId)
      : enabledAiModelIds.includes(modelId);
  };

  const realModels = aiModels.filter(
    (model) => !isVirtualModel(model.modelId) && !model.deprecated,
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
    autoEnableNewAiModels,
    disabledAiModelIds,
    enabledAiModelIds,
  };
};

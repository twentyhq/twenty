import { aiModelsState } from '@/client-config/states/aiModelsState';
import { type SelectOption } from 'twenty-ui/input';

import { DEFAULT_FAST_MODEL } from '@/ai/constants/DefaultFastModel';
import { DEFAULT_SMART_MODEL } from '@/ai/constants/DefaultSmartModel';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { MODEL_FAMILY_CONFIG } from '~/pages/settings/ai/constants/SettingsAiModelProviders';

export const useAiModelOptions = (
  includeDeprecated = false,
): SelectOption<string>[] => {
  const aiModels = useRecoilValueV2(aiModelsState);

  return aiModels
    .filter((model) => includeDeprecated || !model.deprecated)
    .map((model) => ({
      value: model.modelId,
      label:
        model.modelId === DEFAULT_FAST_MODEL ||
        model.modelId === DEFAULT_SMART_MODEL
          ? model.label
          : `${model.label} (${getModelFamilyLabel(model.modelFamily) ?? model.inferenceProvider})`,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
};

const getModelFamilyLabel = (
  modelFamily: string | null | undefined,
): string | undefined => {
  if (!modelFamily) {
    return undefined;
  }

  return MODEL_FAMILY_CONFIG[modelFamily]?.label || modelFamily;
};

export const useAiModelLabel = (
  modelId: string | undefined,
  includeProvider = true,
): string => {
  const aiModels = useRecoilValueV2(aiModelsState);

  if (!modelId) {
    return '';
  }

  const model = aiModels.find((m) => m.modelId === modelId);

  if (!model) {
    return modelId;
  }

  if (
    model.modelId === DEFAULT_FAST_MODEL ||
    model.modelId === DEFAULT_SMART_MODEL ||
    !includeProvider
  ) {
    return model.label;
  }

  return `${model.label} (${getModelFamilyLabel(model.modelFamily) ?? model.inferenceProvider})`;
};

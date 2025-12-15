import { aiModelsState } from '@/client-config/states/aiModelsState';
import { useRecoilValue } from 'recoil';
import { type SelectOption } from 'twenty-ui/input';

import { DEFAULT_FAST_MODEL } from '@/ai/constants/DefaultFastModel';
import { DEFAULT_SMART_MODEL } from '@/ai/constants/DefaultSmartModel';

export const useAiModelOptions = (
  includeDeprecated = false,
): SelectOption<string>[] => {
  const aiModels = useRecoilValue(aiModelsState);

  return aiModels
    .filter((model) => includeDeprecated || !model.deprecated)
    .map((model) => ({
      value: model.modelId,
      label:
        model.modelId === DEFAULT_FAST_MODEL ||
        model.modelId === DEFAULT_SMART_MODEL
          ? model.label
          : `${model.label} (${model.provider})`,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
};

export const useAiModelLabel = (modelId: string | undefined): string => {
  const aiModels = useRecoilValue(aiModelsState);

  if (!modelId) {
    return '';
  }

  const model = aiModels.find((m) => m.modelId === modelId);

  if (!model) {
    return modelId;
  }

  if (
    model.modelId === DEFAULT_FAST_MODEL ||
    model.modelId === DEFAULT_SMART_MODEL
  ) {
    return model.label;
  }

  return `${model.label} (${model.provider})`;
};

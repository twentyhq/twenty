import { type SelectOption } from 'twenty-ui/input';

import { DEFAULT_FAST_MODEL } from '@/ai/constants/DefaultFastModel';
import { DEFAULT_SMART_MODEL } from '@/ai/constants/DefaultSmartModel';
import { useWorkspaceAiModelAvailability } from '@/ai/hooks/useWorkspaceAiModelAvailability';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { useAtomValue } from '@/ui/utilities/state/jotai/hooks/useAtomValue';
import { getModelProviderLabel } from '~/pages/settings/ai/utils/getModelProviderLabel';

export const useAiModelOptions = (
  includeDeprecated = false,
): SelectOption<string>[] => {
  const aiModels = useAtomValue(aiModelsState);
  const { isModelEnabled } = useWorkspaceAiModelAvailability();

  return aiModels
    .filter(
      (model) =>
        (includeDeprecated || !model.deprecated) &&
        isModelEnabled(model.modelId, model),
    )
    .map((model) => ({
      value: model.modelId,
      label:
        model.modelId === DEFAULT_FAST_MODEL ||
        model.modelId === DEFAULT_SMART_MODEL
          ? model.label
          : `${model.label} (${getModelProviderLabel(model.modelFamily) || model.inferenceProvider})`,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
};

export const useAiModelLabel = (
  modelId: string | undefined,
  includeProvider = true,
): string => {
  const aiModels = useAtomValue(aiModelsState);

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

  return `${model.label} (${getModelProviderLabel(model.modelFamily) || model.inferenceProvider})`;
};

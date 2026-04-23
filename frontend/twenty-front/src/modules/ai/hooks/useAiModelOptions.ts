import { type SelectOption } from 'twenty-ui/input';
import { isAutoSelectModelId } from 'twenty-shared/utils';

import { useWorkspaceAiModelAvailability } from '@/ai/hooks/useWorkspaceAiModelAvailability';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useAiModelOptions = (): SelectOption<string>[] => {
  const aiModels = useAtomStateValue(aiModelsState);
  const { isModelEnabled } = useWorkspaceAiModelAvailability();

  return aiModels
    .filter(
      (model) => !model.isDeprecated && isModelEnabled(model.modelId, model),
    )
    .map((model) => ({
      value: model.modelId,
      label: isAutoSelectModelId(model.modelId)
        ? model.label
        : model.modelFamilyLabel
          ? `${model.label} (${model.modelFamilyLabel})`
          : model.label,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
};

export const useAiModelLabel = (
  modelId: string | undefined,
  includeProvider = true,
): string => {
  const aiModels = useAtomStateValue(aiModelsState);

  if (!modelId) {
    return '';
  }

  const model = aiModels.find((m) => m.modelId === modelId);

  if (!model) {
    return modelId;
  }

  if (isAutoSelectModelId(model.modelId) || !includeProvider) {
    return model.label;
  }

  return model.modelFamilyLabel
    ? `${model.label} (${model.modelFamilyLabel})`
    : model.label;
};

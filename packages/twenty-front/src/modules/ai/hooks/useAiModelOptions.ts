import { type SelectOption } from 'twenty-ui/input';

import { DEFAULT_FAST_MODEL } from '@/ai/constants/DefaultFastModel';
import { DEFAULT_SMART_MODEL } from '@/ai/constants/DefaultSmartModel';
import { useWorkspaceAiModelAvailability } from '@/ai/hooks/useWorkspaceAiModelAvailability';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getProviderTypeLabel } from '@/settings/admin-panel/ai/utils/getProviderTypeLabel';

export const useAiModelOptions = (): SelectOption<string>[] => {
  const aiModels = useAtomStateValue(aiModelsState);
  const { isModelEnabled } = useWorkspaceAiModelAvailability();

  return aiModels
    .filter(
      (model) => !model.deprecated && isModelEnabled(model.modelId, model),
    )
    .map((model) => ({
      value: model.modelId,
      label:
        model.modelId === DEFAULT_FAST_MODEL ||
        model.modelId === DEFAULT_SMART_MODEL
          ? model.label
          : `${model.label} (${getProviderTypeLabel(model.provider ?? '')})`,
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

  if (
    model.modelId === DEFAULT_FAST_MODEL ||
    model.modelId === DEFAULT_SMART_MODEL ||
    !includeProvider
  ) {
    return model.label;
  }

  return `${model.label} (${getProviderTypeLabel(model.provider ?? '')})`;
};

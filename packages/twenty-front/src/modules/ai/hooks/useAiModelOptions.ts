import { t } from '@lingui/core/macro';
import { isAutoSelectModelId } from 'twenty-shared/utils';
import { type SelectOption } from 'twenty-ui/input';

import { useWorkspaceAiModelAvailability } from '@/ai/hooks/useWorkspaceAiModelAvailability';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { getModelIcon } from '@/settings/ai/utils/getModelIcon';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type UseAiModelOptionsVariant = 'all' | 'pinned-default';

type UseAiModelOptionsOptions = {
  variant?: UseAiModelOptionsVariant;
};

export const useAiModelOptions = ({
  variant = 'all',
}: UseAiModelOptionsOptions = {}): {
  options: SelectOption<string>[];
  pinnedOption?: SelectOption<string>;
} => {
  const aiModels = useAtomStateValue(aiModelsState);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const { enabledModels } = useWorkspaceAiModelAvailability();

  const workspaceSmartModel = aiModels.find(
    (model) => model.modelId === currentWorkspace?.smartModel,
  );

  const resolvedDefaultModelId = enabledModels.find(
    (model) =>
      model.label === workspaceSmartModel?.label &&
      model.providerName === workspaceSmartModel?.providerName,
  )?.modelId;

  const allOptions = enabledModels
    .map((model) => ({
      value: model.modelId,
      label: model.label,
      Icon: getModelIcon(model.modelFamily, model.providerName),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const pinnedOption = workspaceSmartModel
    ? {
        value: resolvedDefaultModelId ?? workspaceSmartModel.modelId,
        label: workspaceSmartModel.label,
        Icon: getModelIcon(
          workspaceSmartModel.modelFamily,
          workspaceSmartModel.providerName,
        ),
        contextualText: t`default`,
      }
    : undefined;

  const options =
    variant === 'pinned-default' && resolvedDefaultModelId
      ? allOptions.filter((model) => model.value !== resolvedDefaultModelId)
      : allOptions;

  return {
    options,
    pinnedOption: variant === 'pinned-default' ? pinnedOption : undefined,
  };
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

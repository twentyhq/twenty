import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';

import { useWorkspaceAiModelAvailability } from '@/ai/hooks/useWorkspaceAiModelAvailability';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { UpdateWorkspaceDocument } from '~/generated-metadata/graphql';

export const useSettingsAiModelsActions = () => {
  const { enqueueErrorSnackBar } = useSnackBar();
  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );
  const [updateWorkspace] = useMutation(UpdateWorkspaceDocument);
  const { realModels } = useWorkspaceAiModelAvailability();

  const handleModelFieldChange = async (
    field: 'smartModel' | 'fastModel',
    value: string,
  ) => {
    if (!currentWorkspace?.id) return;

    const previousValue = currentWorkspace[field];
    try {
      setCurrentWorkspace({ ...currentWorkspace, [field]: value });
      await updateWorkspace({ variables: { input: { [field]: value } } });
    } catch {
      setCurrentWorkspace({ ...currentWorkspace, [field]: previousValue });
      enqueueErrorSnackBar({ message: t`Failed to update model` });
    }
  };

  const handleUseRecommendedToggle = async (checked: boolean) => {
    if (!currentWorkspace?.id) return;

    const previousValue = currentWorkspace.useRecommendedModels;
    let newEnabledIds = currentWorkspace.enabledAiModelIds ?? [];

    if (!checked && previousValue) {
      newEnabledIds = realModels
        .filter((model) => model.isRecommended)
        .map((model) => model.modelId);
    }

    try {
      setCurrentWorkspace({
        ...currentWorkspace,
        useRecommendedModels: checked,
        enabledAiModelIds: newEnabledIds,
      });
      await updateWorkspace({
        variables: {
          input: {
            useRecommendedModels: checked,
            enabledAiModelIds: newEnabledIds,
          },
        },
      });
    } catch {
      setCurrentWorkspace({
        ...currentWorkspace,
        useRecommendedModels: previousValue,
      });
      enqueueErrorSnackBar({
        message: t`Failed to update model selection mode`,
      });
    }
  };

  const handleModelToggle = async (
    modelId: string,
    isCurrentlyEnabled: boolean,
  ) => {
    if (!currentWorkspace?.id) return;

    const previousEnabled = currentWorkspace.enabledAiModelIds ?? [];
    const newEnabledIds = isCurrentlyEnabled
      ? previousEnabled.filter((id) => id !== modelId)
      : [...previousEnabled, modelId];

    try {
      setCurrentWorkspace({
        ...currentWorkspace,
        enabledAiModelIds: newEnabledIds,
      });
      await updateWorkspace({
        variables: { input: { enabledAiModelIds: newEnabledIds } },
      });
    } catch {
      setCurrentWorkspace({
        ...currentWorkspace,
        enabledAiModelIds: previousEnabled,
      });
      enqueueErrorSnackBar({
        message: t`Failed to update model availability`,
      });
    }
  };

  const handleToggleAllVisibleModels = async (
    shouldCheckAll: boolean,
    visibleModelIds: Set<string>,
  ) => {
    if (!currentWorkspace?.id) return;

    const previousIds = currentWorkspace.enabledAiModelIds ?? [];
    const newEnabledIds = shouldCheckAll
      ? [...new Set([...previousIds, ...visibleModelIds])]
      : previousIds.filter((id) => !visibleModelIds.has(id));

    try {
      setCurrentWorkspace({
        ...currentWorkspace,
        enabledAiModelIds: newEnabledIds,
      });
      await updateWorkspace({
        variables: { input: { enabledAiModelIds: newEnabledIds } },
      });
    } catch {
      setCurrentWorkspace({
        ...currentWorkspace,
        enabledAiModelIds: previousIds,
      });
      enqueueErrorSnackBar({
        message: t`Failed to update model availability`,
      });
    }
  };

  return {
    handleModelFieldChange,
    handleUseRecommendedToggle,
    handleModelToggle,
    handleToggleAllVisibleModels,
  };
};

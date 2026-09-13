import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { type AiModelTier } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import {
  currentWorkspaceState,
  type CurrentWorkspace,
} from '@/auth/states/currentWorkspaceState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import {
  AiModelTier as GraphqlAiModelTier,
  UpdateWorkspaceDocument,
} from '~/generated-metadata/graphql';

// Typed with the generated enum so the same object is both the optimistic
// workspace patch and the mutation input; the enum's keys are the shared tier
// literals, which is what makes the lookup below total.
type WorkspaceAiModelSettingsChanges = Partial<
  Pick<
    CurrentWorkspace,
    | 'aiChatModelTier'
    | 'aiAgentModelTier'
    | 'isAutoModelSelectionEnabled'
    | 'aiModelIdByTier'
  >
>;

export const useSettingsAiModelsActions = () => {
  const { enqueueErrorSnackBar } = useSnackBar();
  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );
  const [updateWorkspace] = useMutation(UpdateWorkspaceDocument);

  const updateAiModelSettings = async (
    changes: WorkspaceAiModelSettingsChanges,
  ) => {
    if (!currentWorkspace?.id) return;

    const previousWorkspace = currentWorkspace;

    try {
      setCurrentWorkspace({ ...currentWorkspace, ...changes });
      await updateWorkspace({ variables: { input: changes } });
    } catch {
      setCurrentWorkspace(previousWorkspace);
      enqueueErrorSnackBar({ message: t`Failed to update model settings` });
    }
  };

  const handleChatTierChange = (tier: AiModelTier) =>
    updateAiModelSettings({ aiChatModelTier: GraphqlAiModelTier[tier] });

  const handleAgentTierChange = (tier: AiModelTier) =>
    updateAiModelSettings({ aiAgentModelTier: GraphqlAiModelTier[tier] });

  const handleAutoModelSelectionToggle = (isEnabled: boolean) =>
    updateAiModelSettings({ isAutoModelSelectionEnabled: isEnabled });

  const handlePinnedModelChange = (
    tier: AiModelTier,
    modelId: string | null,
  ) => {
    const {
      [tier]: _previousPin,
      ...otherPins
    }: Partial<Record<AiModelTier, string>> =
      currentWorkspace?.aiModelIdByTier ?? {};

    return updateAiModelSettings({
      aiModelIdByTier: isDefined(modelId)
        ? { ...otherPins, [tier]: modelId }
        : otherPins,
    });
  };

  return {
    handleChatTierChange,
    handleAgentTierChange,
    handleAutoModelSelectionToggle,
    handlePinnedModelChange,
  };
};

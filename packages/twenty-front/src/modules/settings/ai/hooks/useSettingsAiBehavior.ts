import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  type AiChatAssistantMode,
  FeatureFlagKey,
  PermissionFlagType,
  UpdateWorkspaceDocument,
} from '~/generated-metadata/graphql';

type AssistantModeField =
  | 'aiChatDirectMessageAssistantMode'
  | 'aiChatInboxAssistantMode';

export const useSettingsAiBehavior = () => {
  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );
  const canEditBehavior = useHasPermissionFlag(PermissionFlagType.AI_SETTINGS);
  const isInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const [updateWorkspace, { loading: isSaving }] = useMutation(
    UpdateWorkspaceDocument,
  );
  const [hasSaveFailed, setHasSaveFailed] = useState(false);
  const directMessageMode =
    currentWorkspace?.aiChatDirectMessageAssistantMode ?? null;
  const inboxMode = currentWorkspace?.aiChatInboxAssistantMode ?? null;
  const isLoading = !isDefined(directMessageMode) || !isDefined(inboxMode);

  const saveMode = async ({
    field,
    value,
  }: {
    field: AssistantModeField;
    value: AiChatAssistantMode;
  }) => {
    if (
      !canEditBehavior ||
      !isInboxEnabled ||
      !isDefined(currentWorkspace) ||
      isLoading ||
      isSaving ||
      currentWorkspace[field] === value
    ) {
      return;
    }

    const workspaceId = currentWorkspace.id;
    setHasSaveFailed(false);

    try {
      const { data } = await updateWorkspace({
        variables: { input: { [field]: value } },
      });
      const savedWorkspace = data?.updateWorkspace;

      if (!isDefined(savedWorkspace) || savedWorkspace.id !== workspaceId) {
        setHasSaveFailed(true);
        return;
      }

      setCurrentWorkspace((previousWorkspace) =>
        previousWorkspace?.id === workspaceId
          ? { ...previousWorkspace, [field]: savedWorkspace[field] }
          : previousWorkspace,
      );
    } catch {
      setHasSaveFailed(true);
    }
  };

  const saveDirectMessageMode = (value: AiChatAssistantMode) =>
    saveMode({ field: 'aiChatDirectMessageAssistantMode', value });

  const saveInboxMode = (value: AiChatAssistantMode) =>
    saveMode({ field: 'aiChatInboxAssistantMode', value });

  return {
    directMessageMode,
    inboxMode,
    isLoading,
    isSaving,
    isBehaviorVisible: isInboxEnabled && canEditBehavior,
    errorMessage: hasSaveFailed
      ? t`Failed to save behavior settings. Try again.`
      : undefined,
    saveDirectMessageMode,
    saveInboxMode,
  };
};

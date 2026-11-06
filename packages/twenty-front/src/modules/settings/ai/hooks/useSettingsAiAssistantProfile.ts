import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isCurrentUserLoadedState } from '@/auth/states/isCurrentUserLoadedState';
import { type SettingsAiAssistantProfileOperation } from '@/settings/ai/types/SettingsAiAssistantProfileOperation';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { permissionFlagMapSelector } from '@/settings/roles/states/permissionFlagMapSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { useState } from 'react';
import {
  getAiChatAssistantProfileSchema,
  type AiChatAssistantProfile,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import {
  FeatureFlagKey,
  GetCurrentUserDocument,
  PermissionFlagType,
  ResetAiChatAssistantProfileDocument,
  UpdateWorkspaceDocument,
} from '~/generated-metadata/graphql';
import { getErrorMessageFromApolloError } from '~/utils/get-error-message-from-apollo-error.util';

const ASSISTANT_PROFILE_SCHEMA = getAiChatAssistantProfileSchema();

export const useSettingsAiAssistantProfile = () => {
  const { t } = useLingui();
  const store = useStore();
  const client = useApolloClient();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const isCurrentUserLoaded = useAtomStateValue(isCurrentUserLoadedState);
  const canEditProfile = useHasPermissionFlag(PermissionFlagType.AI_SETTINGS);
  const isInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const isVisible = canEditProfile && isInboxEnabled;
  const [updateWorkspace, { loading: isUpdating }] = useMutation(
    UpdateWorkspaceDocument,
    { fetchPolicy: 'no-cache' },
  );
  const [resetProfile, { loading: isResetting }] = useMutation(
    ResetAiChatAssistantProfileDocument,
    { fetchPolicy: 'no-cache' },
  );
  const [failedOperation, setFailedOperation] =
    useState<SettingsAiAssistantProfileOperation>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasRefreshError, setHasRefreshError] = useState(false);
  const parsedProfile = ASSISTANT_PROFILE_SCHEMA.safeParse(
    currentWorkspace?.aiChatAssistantProfile,
  );
  const profile = parsedProfile.success ? parsedProfile.data : undefined;
  const isSaving = isUpdating || isResetting;
  const isLoading = !isCurrentUserLoaded || isRefreshing;
  const defaultSaveErrorMessage = t`Failed to save assistant settings. Try again.`;

  const performOperation = async ({
    operation,
    workspaceId,
  }: {
    operation: SettingsAiAssistantProfileOperation;
    workspaceId: string;
  }) => {
    if (operation.type === 'reset') {
      const { data } = await resetProfile();
      return { workspaceId, profile: data?.resetAiChatAssistantProfile };
    }

    const { data } = await updateWorkspace({
      variables: { input: { aiChatAssistantProfile: operation.patch } },
    });

    return {
      workspaceId: data?.updateWorkspace.id,
      profile: data?.updateWorkspace.aiChatAssistantProfile,
    };
  };

  const save = async (operation: SettingsAiAssistantProfileOperation) => {
    const requestedWorkspace = store.get(currentWorkspaceState.atom);
    const hasPermission = store.get(permissionFlagMapSelector.atom)[
      PermissionFlagType.AI_SETTINGS
    ];
    const hasInbox = requestedWorkspace?.featureFlags?.some(
      (flag) =>
        flag.key === FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED && flag.value,
    );

    if (
      !hasPermission ||
      !hasInbox ||
      !isDefined(requestedWorkspace) ||
      requestedWorkspace.id !== currentWorkspace?.id ||
      !isDefined(profile) ||
      isLoading ||
      isSaving
    ) {
      return;
    }

    setErrorMessage(undefined);
    setFailedOperation(undefined);

    try {
      const result = await performOperation({
        operation,
        workspaceId: requestedWorkspace.id,
      });
      const savedProfile = ASSISTANT_PROFILE_SCHEMA.safeParse(result.profile);
      const hasMatchingWorkspace = result.workspaceId === requestedWorkspace.id;

      if (!savedProfile.success || !hasMatchingWorkspace) {
        setFailedOperation(operation);
        setErrorMessage(defaultSaveErrorMessage);
        return;
      }

      if (store.get(currentWorkspaceState.atom)?.id !== requestedWorkspace.id) {
        return;
      }

      store.set(currentWorkspaceState.atom, (previousWorkspace) =>
        previousWorkspace?.id === requestedWorkspace.id
          ? { ...previousWorkspace, aiChatAssistantProfile: savedProfile.data }
          : previousWorkspace,
      );
    } catch (error) {
      const hasUserFriendlyMessage =
        CombinedGraphQLErrors.is(error) &&
        isDefined(error.errors[0]?.extensions?.userFriendlyMessage);

      setFailedOperation(operation);
      setErrorMessage(
        hasUserFriendlyMessage
          ? getErrorMessageFromApolloError(error)
          : defaultSaveErrorMessage,
      );
    }
  };

  const saveProfile = (patch: Partial<AiChatAssistantProfile>) =>
    save({ type: 'update', patch });

  const reset = () => save({ type: 'reset' });

  const refreshProfile = async () => {
    const requestedWorkspace = store.get(currentWorkspaceState.atom);

    if (!isDefined(requestedWorkspace) || !isVisible || isLoading || isSaving) {
      return;
    }

    setIsRefreshing(true);
    setHasRefreshError(false);

    try {
      const { data } = await client.query({
        query: GetCurrentUserDocument,
        fetchPolicy: 'no-cache',
      });
      const workspace = data?.currentUser.currentWorkspace;
      const refreshedProfile = ASSISTANT_PROFILE_SCHEMA.safeParse(
        workspace?.aiChatAssistantProfile,
      );

      if (store.get(currentWorkspaceState.atom)?.id !== requestedWorkspace.id) {
        return;
      }

      if (
        !refreshedProfile.success ||
        workspace?.id !== requestedWorkspace.id
      ) {
        setHasRefreshError(true);
        return;
      }

      store.set(currentWorkspaceState.atom, (previousWorkspace) =>
        previousWorkspace?.id === requestedWorkspace.id
          ? {
              ...previousWorkspace,
              aiChatAssistantProfile: refreshedProfile.data,
            }
          : previousWorkspace,
      );
    } catch {
      setHasRefreshError(true);
    } finally {
      setIsRefreshing(false);
    }
  };

  const retry = () => {
    if (isDefined(failedOperation)) {
      return save(failedOperation);
    }

    return refreshProfile();
  };

  return {
    profile,
    workspaceId: currentWorkspace?.id,
    isVisible,
    isLoading,
    hasLoadError: hasRefreshError || !isDefined(profile),
    isSaving,
    errorMessage,
    saveProfile,
    reset,
    retry,
  };
};

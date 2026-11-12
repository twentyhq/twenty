import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isSettingsAiAssistantProfileSavingState } from '@/settings/ai/states/isSettingsAiAssistantProfileSavingState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import {
  getAiChatAssistantProfileSchema,
  type AiChatAssistantProfile,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { UpdateWorkspaceDocument } from '~/generated-metadata/graphql';
import { getErrorMessageFromApolloError } from '~/utils/get-error-message-from-apollo-error.util';

const ASSISTANT_PROFILE_SCHEMA = getAiChatAssistantProfileSchema();

export const useSettingsAiAssistantProfile = () => {
  const { t } = useLingui();
  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );
  const [
    isSettingsAiAssistantProfileSaving,
    setIsSettingsAiAssistantProfileSaving,
  ] = useAtomState(isSettingsAiAssistantProfileSavingState);
  const [updateWorkspace] = useMutation(UpdateWorkspaceDocument);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const parsedProfile = ASSISTANT_PROFILE_SCHEMA.safeParse(
    currentWorkspace?.aiChatAssistantProfile,
  );

  const saveProfile = async (patch: Partial<AiChatAssistantProfile>) => {
    setIsSettingsAiAssistantProfileSaving(true);
    setErrorMessage(undefined);

    try {
      const { data } = await updateWorkspace({
        variables: { input: { aiChatAssistantProfile: patch } },
      });
      const savedProfile = data?.updateWorkspace.aiChatAssistantProfile;

      if (!isDefined(savedProfile)) {
        return;
      }

      setCurrentWorkspace((previousWorkspace) =>
        isDefined(previousWorkspace)
          ? { ...previousWorkspace, aiChatAssistantProfile: savedProfile }
          : previousWorkspace,
      );
    } catch (error) {
      const hasUserFriendlyMessage =
        CombinedGraphQLErrors.is(error) &&
        isDefined(error.errors[0]?.extensions?.userFriendlyMessage);

      setErrorMessage(
        hasUserFriendlyMessage
          ? getErrorMessageFromApolloError(error)
          : t`Failed to save assistant settings. Try again.`,
      );
    } finally {
      setIsSettingsAiAssistantProfileSaving(false);
    }
  };

  return {
    profile: parsedProfile.success ? parsedProfile.data : undefined,
    isSaving: isSettingsAiAssistantProfileSaving,
    errorMessage,
    saveProfile,
  };
};

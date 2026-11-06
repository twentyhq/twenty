import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useEffect } from 'react';
import { getAiChatAssistantProfileSchema } from 'twenty-shared/ai';
import { type GetWorkspaceAiChatAssistantProfileQuery } from '~/generated-metadata/graphql';

type SettingsAiAssistantProfileSyncEffectProps = {
  workspace: GetWorkspaceAiChatAssistantProfileQuery['currentWorkspace'];
};

const ASSISTANT_PROFILE_SCHEMA = getAiChatAssistantProfileSchema();

export const SettingsAiAssistantProfileSyncEffect = ({
  workspace,
}: SettingsAiAssistantProfileSyncEffectProps) => {
  const setCurrentWorkspace = useSetAtomState(currentWorkspaceState);

  useEffect(() => {
    const parsedProfile = ASSISTANT_PROFILE_SCHEMA.safeParse(
      workspace.aiChatAssistantProfile,
    );

    if (!parsedProfile.success) {
      return;
    }

    setCurrentWorkspace((previousWorkspace) =>
      previousWorkspace?.id === workspace.id
        ? { ...previousWorkspace, aiChatAssistantProfile: parsedProfile.data }
        : previousWorkspace,
    );
  }, [workspace, setCurrentWorkspace]);

  return null;
};

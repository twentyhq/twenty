import { useMutation } from '@apollo/client/react';

import {
  type CurrentWorkspaceMember,
  currentWorkspaceMemberState,
} from '@/auth/states/currentWorkspaceMemberState';
import { UPDATE_WORKSPACE_MEMBER_SETTINGS } from '@/settings/profile/graphql/mutations/updateWorkspaceMemberSettings';
import {
  mergeWorkspaceMemberSettingsIntoCurrent,
  type WorkspaceMemberSettingsUpdateInput,
} from '@/settings/profile/utils/mergeWorkspaceMemberSettingsIntoCurrent';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

type UpdateWorkspaceMemberSettingsMutationData = {
  updateWorkspaceMemberSettings: boolean;
};

export type { WorkspaceMemberSettingsUpdateInput };

export const useUpdateWorkspaceMemberSettings = () => {
  const [updateWorkspaceMemberSettingsMutation] =
    useMutation<UpdateWorkspaceMemberSettingsMutationData>(
      UPDATE_WORKSPACE_MEMBER_SETTINGS,
    );
  const setCurrentWorkspaceMember = useSetAtomState(
    currentWorkspaceMemberState,
  );

  const updateWorkspaceMemberSettings = async ({
    workspaceMemberId,
    update,
  }: {
    workspaceMemberId: string;
    update:
      | WorkspaceMemberSettingsUpdateInput
      | Partial<CurrentWorkspaceMember>
      | Record<string, unknown>;
  }) => {
    const { data } = await updateWorkspaceMemberSettingsMutation({
      variables: {
        input: {
          workspaceMemberId,
          update,
        },
      },
    });

    if (data?.updateWorkspaceMemberSettings === true) {
      setCurrentWorkspaceMember((previous) => {
        if (!previous || previous.id !== workspaceMemberId) {
          return previous;
        }
        return mergeWorkspaceMemberSettingsIntoCurrent(previous, update);
      });
    }
  };

  return {
    updateWorkspaceMemberSettings,
  };
};

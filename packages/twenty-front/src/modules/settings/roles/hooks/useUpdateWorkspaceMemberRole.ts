import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { useRecoilState, useSetRecoilState } from 'recoil';
import {
  useUpdateWorkspaceMemberRoleMutation,
  WorkspaceMember,
} from '~/generated-metadata/graphql';

type AddWorkspaceMemberToRoleAndUpdateStateParams = {
  workspaceMemberId: string;
};

type UpdateWorkspaceMemberRoleDraftStateParams = {
  workspaceMember: WorkspaceMember;
};

type AddWorkspaceMembersToRoleParams = {
  roleId: string;
  workspaceMemberIds: string[];
};

export const useUpdateWorkspaceMemberRole = (roleId: string) => {
  const setSettingsPersistedRole = useSetRecoilState(
    settingsPersistedRoleFamilyState(roleId),
  );
  const [settingsDraftRole, setSettingsDraftRole] = useRecoilState(
    settingsDraftRoleFamilyState(roleId),
  );

  const [updateWorkspaceMemberRoleMutation] =
    useUpdateWorkspaceMemberRoleMutation();

  const updateWorkspaceMemberRoleDraftState = ({
    workspaceMember,
  }: UpdateWorkspaceMemberRoleDraftStateParams) => {
    setSettingsDraftRole({
      ...settingsDraftRole,
      workspaceMembers: [
        ...settingsDraftRole.workspaceMembers,
        {
          id: workspaceMember.id,
          name: workspaceMember.name,
          colorScheme: workspaceMember.colorScheme,
          userEmail: workspaceMember.userEmail,
        },
      ],
    });
  };

  const addWorkspaceMemberToRoleAndUpdateState = async ({
    workspaceMemberId,
  }: AddWorkspaceMemberToRoleAndUpdateStateParams) => {
    const { data } = await updateWorkspaceMemberRoleMutation({
      variables: {
        workspaceMemberId,
        roleId,
      },
    });

    if (data?.updateWorkspaceMemberRole !== undefined) {
      const updatedWorkspaceMember = data.updateWorkspaceMemberRole;
      const updatedWorkspaceMembers = [
        ...settingsDraftRole.workspaceMembers,
        {
          id: updatedWorkspaceMember.id,
          name: updatedWorkspaceMember.name,
          colorScheme: updatedWorkspaceMember.colorScheme,
          userEmail: updatedWorkspaceMember.userEmail,
        },
      ];

      const updatedRole = {
        ...settingsDraftRole,
        workspaceMembers: updatedWorkspaceMembers,
      };

      setSettingsPersistedRole(updatedRole);
      setSettingsDraftRole(updatedRole);
    }

    return data?.updateWorkspaceMemberRole;
  };

  const addWorkspaceMembersToRole = async ({
    roleId,
    workspaceMemberIds,
  }: AddWorkspaceMembersToRoleParams) => {
    await Promise.all(
      workspaceMemberIds.map((workspaceMemberId) =>
        updateWorkspaceMemberRoleMutation({
          variables: {
            roleId,
            workspaceMemberId,
          },
        }),
      ),
    );
  };

  return {
    addWorkspaceMemberToRoleAndUpdateState,
    updateWorkspaceMemberRoleDraftState,
    addWorkspaceMembersToRole,
  };
};

import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { useRecoilState, useSetRecoilState } from 'recoil';
import {
  useUpdateWorkspaceMemberRoleMutation,
  WorkspaceMember,
} from '~/generated/graphql';

type AddWorkspaceMemberRoleParams = {
  workspaceMemberId: string;
};

type UpdateWorkspaceMemberRoleStateParams = {
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

  const updateWorkspaceMemberRoleState = ({
    workspaceMember,
  }: UpdateWorkspaceMemberRoleStateParams) => {
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

  const addWorkspaceMemberRole = async ({
    workspaceMemberId,
  }: AddWorkspaceMemberRoleParams) => {
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
    for (const workspaceMemberId of workspaceMemberIds) {
      await updateWorkspaceMemberRoleMutation({
        variables: {
          roleId,
          workspaceMemberId,
        },
      });
    }
  };

  return {
    addWorkspaceMemberRole,
    updateWorkspaceMemberRoleState,
    addWorkspaceMembersToRole,
  };
};

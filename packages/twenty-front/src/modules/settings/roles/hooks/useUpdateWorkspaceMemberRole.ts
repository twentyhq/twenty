import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { useUpdateWorkspaceMemberRoleMutation } from '~/generated-metadata/graphql';

type AddWorkspaceMemberToRoleAndUpdateStateParams = {
  workspaceMemberId: string;
};

type UpdateWorkspaceMemberRoleDraftStateParams = {
  workspaceMember: PartialWorkspaceMember;
};

type AddWorkspaceMembersToRoleParams = {
  roleId: string;
  workspaceMemberIds: string[];
};

export const useUpdateWorkspaceMemberRole = (roleId: string) => {
  const setSettingsPersistedRole = useSetAtomFamilyState(
    settingsPersistedRoleFamilyState,
    roleId,
  );
  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );
  const setSettingsDraftRole = useSetAtomFamilyState(
    settingsDraftRoleFamilyState,
    roleId,
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
          userEmail: workspaceMember.userEmail,
          avatarUrl: workspaceMember.avatarUrl,
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

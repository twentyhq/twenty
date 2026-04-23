import { useSettingsAllRoles } from '@/settings/roles/hooks/useSettingsAllRoles';
import { settingsRolesIsLoadingState } from '@/settings/roles/states/settingsRolesIsLoadingState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useWorkspaceMemberRoles = (workspaceMemberId: string) => {
  const settingsAllRoles = useSettingsAllRoles();
  const settingsRolesIsLoading = useAtomStateValue(settingsRolesIsLoadingState);

  const roles = workspaceMemberId
    ? settingsAllRoles.filter((role) =>
        role.workspaceMembers.some((member) => member.id === workspaceMemberId),
      )
    : [];

  return {
    roles,
    allRoles: settingsAllRoles,
    loading: settingsRolesIsLoading,
  };
};

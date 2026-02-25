import { useSettingsAllRoles } from '@/settings/roles/hooks/useSettingsAllRoles';
import { settingsRolesIsLoadingStateV2 } from '@/settings/roles/states/settingsRolesIsLoadingStateV2';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useWorkspaceMemberRoles = (workspaceMemberId: string) => {
  const settingsAllRoles = useSettingsAllRoles();
  const settingsRolesIsLoading = useAtomStateValue(
    settingsRolesIsLoadingStateV2,
  );

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

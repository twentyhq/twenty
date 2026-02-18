import { settingsAllRolesSelector } from '@/settings/roles/states/settingsAllRolesSelector';
import { settingsRolesIsLoadingStateV2 } from '@/settings/roles/states/settingsRolesIsLoadingStateV2';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { useRecoilValue } from 'recoil';

export const useWorkspaceMemberRoles = (workspaceMemberId: string) => {
  const settingsAllRoles = useRecoilValue(settingsAllRolesSelector);
  const settingsRolesIsLoading = useRecoilValueV2(
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

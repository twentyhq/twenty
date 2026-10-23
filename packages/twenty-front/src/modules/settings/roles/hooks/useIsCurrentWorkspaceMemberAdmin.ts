import { ADMIN_ROLE_UNIVERSAL_IDENTIFIER } from 'twenty-shared/constants';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useSettingsAllRoles } from '@/settings/roles/hooks/useSettingsAllRoles';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useIsCurrentWorkspaceMemberAdmin = (): boolean => {
  const settingsAllRoles = useSettingsAllRoles();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  const adminRole = settingsAllRoles.find(
    (role) => role.universalIdentifier === ADMIN_ROLE_UNIVERSAL_IDENTIFIER,
  );

  return (
    adminRole?.workspaceMembers.some(
      (member) => member.id === currentWorkspaceMember?.id,
    ) === true
  );
};

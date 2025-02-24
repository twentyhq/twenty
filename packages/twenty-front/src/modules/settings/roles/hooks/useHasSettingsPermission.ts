import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { useRecoilValue } from 'recoil';
import { SettingsPermissions } from '~/generated/graphql';

export const useHasSettingsPermission = (
  settingsPermission?: SettingsPermissions,
) => {
  const currentUserWorkspace = useRecoilValue(currentUserWorkspaceState);

  if (!settingsPermission) {
    return true;
  }

  const currentUserWorkspaceSettingsPermissions =
    currentUserWorkspace?.settingsPermissions;

  if (!currentUserWorkspaceSettingsPermissions) {
    return false;
  }

  return currentUserWorkspaceSettingsPermissions.includes(settingsPermission);
};

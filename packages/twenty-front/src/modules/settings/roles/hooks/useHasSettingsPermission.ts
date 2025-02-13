import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { useRecoilValue } from 'recoil';
import { SettingsFeatures } from 'twenty-shared';

export const useHasSettingsPermission = (settingsFeature: SettingsFeatures) => {
  const currentUserWorkspace = useRecoilValue(currentUserWorkspaceState);

  const currentUserWorkspaceSettingsPermissions =
    currentUserWorkspace?.settingsPermissions;

  if (!currentUserWorkspaceSettingsPermissions) {
    return false;
  }

  return currentUserWorkspaceSettingsPermissions.includes(settingsFeature);
};

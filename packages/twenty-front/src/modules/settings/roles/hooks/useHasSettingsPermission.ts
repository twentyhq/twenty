import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRecoilValue } from 'recoil';
import { SettingsPermissions } from '~/generated/graphql';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

export const useHasSettingsPermission = (
  settingsPermission?: SettingsPermissions,
) => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const currentUserWorkspace = useRecoilValue(currentUserWorkspaceState);

  if (!settingsPermission) {
    return true;
  }

  if (
    settingsPermission === SettingsPermissions.WORKSPACE &&
    currentWorkspace?.activationStatus ===
      WorkspaceActivationStatus.PENDING_CREATION
  ) {
    return true;
  }

  const currentUserWorkspaceSettingsPermissions =
    currentUserWorkspace?.settingsPermissions;

  if (!currentUserWorkspaceSettingsPermissions) {
    return false;
  }

  return currentUserWorkspaceSettingsPermissions.includes(settingsPermission);
};

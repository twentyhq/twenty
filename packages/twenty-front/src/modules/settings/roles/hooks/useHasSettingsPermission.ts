import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRecoilValue } from 'recoil';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Setting } from '~/generated/graphql';

export const useHasSettingsPermission = (settingsPermission?: Setting) => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const currentUserWorkspace = useRecoilValue(currentUserWorkspaceState);

  if (!settingsPermission) {
    return true;
  }

  if (
    settingsPermission === Setting.WORKSPACE &&
    currentWorkspace?.activationStatus ===
      WorkspaceActivationStatus.PENDING_CREATION
  ) {
    return true;
  }

  const currentUserWorkspaceSetting = currentUserWorkspace?.settingsPermissions;

  if (!currentUserWorkspaceSetting) {
    return false;
  }

  return currentUserWorkspaceSetting.includes(settingsPermission);
};

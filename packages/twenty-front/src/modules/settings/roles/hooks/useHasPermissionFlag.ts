import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRecoilValue } from 'recoil';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { PermissionFlagType } from '~/generated/graphql';

export const useHasPermissionFlag = (permissionFlag?: PermissionFlagType) => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const currentUserWorkspace = useRecoilValue(currentUserWorkspaceState);

  if (!permissionFlag) {
    return true;
  }

  if (
    permissionFlag === PermissionFlagType.WORKSPACE &&
    currentWorkspace?.activationStatus ===
      WorkspaceActivationStatus.PENDING_CREATION
  ) {
    return true;
  }

  const currentUserWorkspaceSetting = currentUserWorkspace?.permissionFlags;

  if (!currentUserWorkspaceSetting) {
    return false;
  }

  return currentUserWorkspaceSetting.includes(permissionFlag);
};

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { useRecoilValue } from 'recoil';
import {
  WorkspaceActivationStatus,
  PermissionFlagType,
} from '~/generated/graphql';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';

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

  const userFlags = currentUserWorkspace?.permissionFlags ?? [];
  return userFlags.includes(permissionFlag);
};

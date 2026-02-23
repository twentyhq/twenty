import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import {
  WorkspaceActivationStatus,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';

export const useHasPermissionFlag = (permissionFlag?: PermissionFlagType) => {
  const currentWorkspace = useRecoilValueV2(currentWorkspaceState);
  const currentUserWorkspace = useRecoilValueV2(currentUserWorkspaceState);

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

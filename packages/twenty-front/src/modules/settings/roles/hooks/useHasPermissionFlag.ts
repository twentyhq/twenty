import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import {
  WorkspaceActivationStatus,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomValue } from '@/ui/utilities/state/jotai/hooks/useAtomValue';

export const useHasPermissionFlag = (permissionFlag?: PermissionFlagType) => {
  const currentWorkspace = useAtomValue(currentWorkspaceState);
  const currentUserWorkspace = useAtomValue(currentUserWorkspaceState);

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

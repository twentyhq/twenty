import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import {
  WorkspaceActivationStatus,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useHasPermissionFlagGrant = (
  permissionFlagGrant?: PermissionFlagType,
) => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const currentUserWorkspace = useAtomStateValue(currentUserWorkspaceState);

  if (!permissionFlagGrant) {
    return true;
  }

  if (
    permissionFlagGrant === PermissionFlagType.WORKSPACE &&
    currentWorkspace?.activationStatus ===
      WorkspaceActivationStatus.PENDING_CREATION
  ) {
    return true;
  }

  const userFlags = currentUserWorkspace?.permissionFlagGrants ?? [];
  return userFlags.includes(permissionFlagGrant);
};

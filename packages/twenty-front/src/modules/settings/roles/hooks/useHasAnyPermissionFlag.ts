import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type PermissionFlagType } from '~/generated-metadata/graphql';

export const useHasAnyPermissionFlag = (
  permissionFlags?: PermissionFlagType[],
) => {
  const currentUserWorkspace = useAtomStateValue(currentUserWorkspaceState);

  if (!permissionFlags || permissionFlags.length === 0) {
    return true;
  }

  const userFlags = currentUserWorkspace?.permissionFlags ?? [];

  return permissionFlags.some((flag) => userFlags.includes(flag));
};

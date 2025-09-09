import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRecoilValue } from 'recoil';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { PermissionFlagType } from '~/generated/graphql';

type ExtendedPermissionFlag = PermissionFlagType | 'IMPERSONATE';

const ALLOWED_FLAGS: ReadonlySet<string> = new Set([
  ...Object.values(PermissionFlagType).map((f) => String(f)),
  'IMPERSONATE',
]);

export const useHasPermissionFlag = (
  permissionFlag?: ExtendedPermissionFlag,
) => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const currentUserWorkspace = useRecoilValue(currentUserWorkspaceState);

  if (!permissionFlag) {
    return true;
  }

  const normalizedFlag = String(permissionFlag);

  if (!ALLOWED_FLAGS.has(normalizedFlag)) {
    return false;
  }

  const isWorkspaceFlag = normalizedFlag === PermissionFlagType.WORKSPACE;

  if (
    isWorkspaceFlag &&
    currentWorkspace?.activationStatus ===
      WorkspaceActivationStatus.PENDING_CREATION
  ) {
    return true;
  }

  const userFlags = currentUserWorkspace?.permissionFlags;
  if (!userFlags || userFlags.length === 0) {
    return false;
  }

  const userFlagSet = new Set<string>(userFlags.map((f) => String(f)));

  return userFlagSet.has(normalizedFlag);
};

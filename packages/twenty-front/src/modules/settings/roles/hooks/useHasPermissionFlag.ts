import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRecoilValue } from 'recoil';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { PermissionFlagType } from '~/generated/graphql';

type ExtendedPermissionFlag = PermissionFlagType | 'IMPERSONATE';

const ALLOWED_FLAGS: ReadonlySet<string> = new Set([
  ...Object.values(PermissionFlagType),
  'IMPERSONATE',
]);

const normalizeFlag = (flag: ExtendedPermissionFlag): string => {
  return typeof flag === 'string' ? flag : (flag as unknown as string);
};

export const useHasPermissionFlag = (
  permissionFlag?: ExtendedPermissionFlag,
) => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const currentUserWorkspace = useRecoilValue(currentUserWorkspaceState);

  if (!permissionFlag) {
    return true;
  }

  const normalizedFlag = normalizeFlag(permissionFlag);

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

  const userFlagSet = new Set<string>(userFlags as unknown as string[]);

  return userFlagSet.has(normalizedFlag);
};

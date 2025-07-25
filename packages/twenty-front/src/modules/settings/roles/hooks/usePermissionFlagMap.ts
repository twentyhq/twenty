import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { useRecoilValue } from 'recoil';
import { PermissionFlagType } from '~/generated/graphql';
import { buildRecordFromKeysWithSameValue } from '~/utils/array/buildRecordFromKeysWithSameValue';

export const usePermissionFlagMap = (): Record<PermissionFlagType, boolean> => {
  const currentUserWorkspace = useRecoilValue(currentUserWorkspaceState);

  const currentUserWorkspaceSettingsPermissions =
    currentUserWorkspace?.permissionFlags;

  const initialPermissions = buildRecordFromKeysWithSameValue(
    Object.values(PermissionFlagType),
    false,
  );

  if (!currentUserWorkspaceSettingsPermissions) {
    return initialPermissions;
  }

  return currentUserWorkspaceSettingsPermissions.reduce((acc, permission) => {
    acc[permission] = true;
    return acc;
  }, initialPermissions);
};

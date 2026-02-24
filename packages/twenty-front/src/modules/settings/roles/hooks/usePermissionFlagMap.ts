import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { buildRecordFromKeysWithSameValue } from '~/utils/array/buildRecordFromKeysWithSameValue';
import { useAtomValue } from '@/ui/utilities/state/jotai/hooks/useAtomValue';

export const usePermissionFlagMap = (): Record<PermissionFlagType, boolean> => {
  const currentUserWorkspace = useAtomValue(currentUserWorkspaceState);

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

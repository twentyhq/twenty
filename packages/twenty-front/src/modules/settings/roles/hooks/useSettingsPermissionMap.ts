import { currentUserState } from '@/auth/states/currentUserState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { useRecoilValue } from 'recoil';
import { SettingPermissionType } from '~/generated/graphql';
import { buildRecordFromKeysWithSameValue } from '~/utils/array/buildRecordFromKeysWithSameValue';

export const useSettingsPermissionMap = (): Record<
  SettingPermissionType,
  boolean
> => {
  const currentUser = useRecoilValue(currentUserState);
  const currentUserWorkspace = useRecoilValue(currentUserWorkspaceState);

  const currentUserWorkspaceSettingsPermissions =
    currentUserWorkspace?.settingsPermissions;

  const initialPermissions = buildRecordFromKeysWithSameValue(
    Object.values(SettingPermissionType),
    false,
  );

  // Super Admin users have access to all settings
  const isSuperAdmin =
    currentUser?.canImpersonate || currentUser?.canAccessFullAdminPanel;

  if (isSuperAdmin === true) {
    return buildRecordFromKeysWithSameValue(
      Object.values(SettingPermissionType),
      true,
    );
  }

  if (!currentUserWorkspaceSettingsPermissions) {
    return initialPermissions;
  }

  return currentUserWorkspaceSettingsPermissions.reduce((acc, permission) => {
    acc[permission] = true;
    return acc;
  }, initialPermissions);
};

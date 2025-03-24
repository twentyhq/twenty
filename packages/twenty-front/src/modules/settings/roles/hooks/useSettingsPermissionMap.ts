import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useRecoilValue } from 'recoil';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { SettingPermissionType } from '~/generated/graphql';
import { buildRecordFromKeysWithSameValue } from '~/utils/array/buildRecordFromKeysWithSameValue';

export const useSettingsPermissionMap = (): Record<
  SettingPermissionType,
  boolean
> => {
  const currentUserWorkspace = useRecoilValue(currentUserWorkspaceState);

  const isPermissionEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IsPermissionsEnabled,
  );

  const currentUserWorkspaceSettingsPermissions =
    currentUserWorkspace?.settingsPermissions;

  const initialPermissions = buildRecordFromKeysWithSameValue(
    Object.values(SettingPermissionType),
    !isPermissionEnabled,
  );

  if (!currentUserWorkspaceSettingsPermissions) {
    return initialPermissions;
  }

  return currentUserWorkspaceSettingsPermissions.reduce((acc, permission) => {
    acc[permission] = true;
    return acc;
  }, initialPermissions);
};

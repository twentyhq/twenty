import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useRecoilValue } from 'recoil';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { Setting } from '~/generated/graphql';
import { buildRecordFromKeysWithSameValue } from '~/utils/array/buildRecordFromKeysWithSameValue';

export const useSettingsPermissionMap = (): Record<Setting, boolean> => {
  const currentUserWorkspace = useRecoilValue(currentUserWorkspaceState);

  const isPermissionEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IsPermissionsEnabled,
  );

  const currentUserWorkspaceSettingsPermissions =
    currentUserWorkspace?.settingsPermissions;

  const initialPermissions = buildRecordFromKeysWithSameValue(
    Object.values(Setting),
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

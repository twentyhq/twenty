import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { useRecoilValue } from 'recoil';
import { SettingsFeatures } from 'twenty-shared';

export const useSettingsPermissionMap = (): Record<
  SettingsFeatures,
  boolean
> => {
  const currentUserWorkspace = useRecoilValue(currentUserWorkspaceState);

  const currentUserWorkspaceSettingsPermissions =
    currentUserWorkspace?.settingsPermissions;

  const initialPermissions = Object.fromEntries(
    Object.values(SettingsFeatures).map((feature) => [feature, false]),
  ) as Record<SettingsFeatures, boolean>;

  if (!currentUserWorkspaceSettingsPermissions) {
    return initialPermissions;
  }

  return currentUserWorkspaceSettingsPermissions.reduce(
    (acc, permission) => {
      acc[permission] = true;
      return acc;
    },
    { ...initialPermissions },
  );
};

import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { Navigate, Outlet } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import {
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

export const SettingsAppPreferencesRouteGuard = () => {
  const isAppPreferencesEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
  );
  const canManageConnectedAccounts = useHasPermissionFlag(
    PermissionFlagType.CONNECTED_ACCOUNTS,
  );

  return isAppPreferencesEnabled ? (
    <Outlet />
  ) : (
    <Navigate
      to={getSettingsPath(
        canManageConnectedAccounts
          ? SettingsPath.Accounts
          : SettingsPath.ProfilePage,
      )}
      replace
    />
  );
};

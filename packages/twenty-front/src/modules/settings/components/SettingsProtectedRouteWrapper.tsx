import { useHasSettingsPermission } from '@/settings/roles/hooks/useHasSettingsPermission';
import { SettingsPath } from '@/types/SettingsPath';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { FeatureFlagKey, SettingsFeatures } from '~/generated/graphql';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

type SettingsProtectedRouteWrapperProps = {
  children?: ReactNode;
  settingsPermission?: SettingsFeatures;
  requiredFeatureFlag?: FeatureFlagKey;
};

export const SettingsProtectedRouteWrapper = ({
  children,
  settingsPermission,
  requiredFeatureFlag,
}: SettingsProtectedRouteWrapperProps) => {
  const isPermissionsEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IsPermissionsEnabled,
  );
  const hasPermission = useHasSettingsPermission(settingsPermission);
  const requiredFeatureFlagEnabled = useIsFeatureEnabled(
    requiredFeatureFlag || null,
  );

  if (
    (requiredFeatureFlag && !requiredFeatureFlagEnabled) ||
    (!hasPermission && isPermissionsEnabled)
  ) {
    return <Navigate to={getSettingsPath(SettingsPath.ProfilePage)} replace />;
  }

  return children ?? <Outlet />;
};

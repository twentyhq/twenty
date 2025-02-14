import { useHasSettingsPermission } from '@/settings/roles/hooks/useHasSettingsPermission';
import { SettingsPath } from '@/types/SettingsPath';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { FeatureFlagKey, SettingsFeatures } from '~/generated/graphql';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

type SettingsProtectedRouteWrapperProps = {
  children?: ReactNode;
  feature: SettingsFeatures;
  requiresFeatureFlag?: FeatureFlagKey;
};

export const SettingsProtectedRouteWrapper = ({
  children,
  feature,
  requiresFeatureFlag,
}: SettingsProtectedRouteWrapperProps) => {
  const isPermissionsEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IsPermissionsEnabled,
  );
  const hasPermission = useHasSettingsPermission(feature);
  const requiredFeatureFlagEnabled = useIsFeatureEnabled(
    requiresFeatureFlag || null,
  );

  if (
    (requiresFeatureFlag && !requiredFeatureFlagEnabled) ||
    (!hasPermission && isPermissionsEnabled)
  ) {
    return <Navigate to={getSettingsPath(SettingsPath.ProfilePage)} replace />;
  }

  return children ?? <Outlet />;
};

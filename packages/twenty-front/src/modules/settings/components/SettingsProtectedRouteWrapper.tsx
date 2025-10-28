import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { type ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import {
  type FeatureFlagKey,
  type PermissionFlagType,
} from '~/generated/graphql';

type SettingsProtectedRouteWrapperProps = {
  children?: ReactNode;
  settingsPermission?: PermissionFlagType;
  requiredFeatureFlag?: FeatureFlagKey;
};

export const SettingsProtectedRouteWrapper = ({
  children,
  settingsPermission,
  requiredFeatureFlag,
}: SettingsProtectedRouteWrapperProps) => {
  const isLoggedIn = useIsLogged();
  const hasPermission = useHasPermissionFlag(settingsPermission);
  const requiredFeatureFlagEnabled = useIsFeatureEnabled(
    requiredFeatureFlag || null,
  );

  if (!isLoggedIn) {
    return null;
  }

  // TODO: this should be part of PageChangeEffect as otherwise we will have multiple sources of redirection that can:
  // - conflict (race conditions)
  // - degrade performance as we will redirect multiple times
  if ((requiredFeatureFlag && !requiredFeatureFlagEnabled) || !hasPermission) {
    return <Navigate to={getSettingsPath(SettingsPath.ProfilePage)} replace />;
  }

  return children ?? <Outlet />;
};

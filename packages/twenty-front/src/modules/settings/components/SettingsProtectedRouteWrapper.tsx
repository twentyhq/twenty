import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { type ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import {
  type FeatureFlagKey,
  type PermissionFlagType,
} from '~/generated-metadata/graphql';

type SettingsProtectedRouteWrapperProps = {
  children?: ReactNode;
  settingsPermission?: PermissionFlagType;
  requiredFeatureFlag?: FeatureFlagKey;
  // Rendered in place of the redirect, for a surface where redirecting would
  // take the main outlet with it.
  fallback?: ReactNode;
};

export const SettingsProtectedRouteWrapper = ({
  children,
  settingsPermission,
  requiredFeatureFlag,
  fallback,
}: SettingsProtectedRouteWrapperProps) => {
  const isLogged = useIsLogged();
  const hasPermission = useHasPermissionFlag(settingsPermission);
  const requiredFeatureFlagEnabled = useIsFeatureEnabled(
    requiredFeatureFlag || null,
  );

  if (!isLogged) {
    return null;
  }

  // TODO: this should be part of PageChangeEffect as otherwise we will have multiple sources of redirection that can:
  // - conflict (race conditions)
  // - degrade performance as we will redirect multiple times
  if ((requiredFeatureFlag && !requiredFeatureFlagEnabled) || !hasPermission) {
    if (isDefined(fallback)) {
      return <>{fallback}</>;
    }

    return <Navigate to={getSettingsPath(SettingsPath.ProfilePage)} replace />;
  }

  return children ?? <Outlet />;
};

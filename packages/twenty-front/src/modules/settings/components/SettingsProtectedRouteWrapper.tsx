import { WorkspaceRouteUnavailable } from '@/app/routing/components/WorkspaceRouteUnavailable';
import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { Trans } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import {
  type FeatureFlagKey,
  type PermissionFlagType,
} from '~/generated-metadata/graphql';

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
  const isLogged = useIsLogged();
  const hasPermission = useHasPermissionFlag(settingsPermission);
  const requiredFeatureFlagEnabled = useIsFeatureEnabled(
    requiredFeatureFlag || null,
  );
  const workspaceSurface = useWorkspaceSurface();

  if (!isLogged) {
    return null;
  }

  // TODO: this should be part of PageChangeEffect as otherwise we will have multiple sources of redirection that can:
  // - conflict (race conditions)
  // - degrade performance as we will redirect multiple times
  if ((requiredFeatureFlag && !requiredFeatureFlagEnabled) || !hasPermission) {
    if (workspaceSurface.type === 'side-panel') {
      return (
        <WorkspaceRouteUnavailable>
          <Trans>You don't have access to this settings page.</Trans>
        </WorkspaceRouteUnavailable>
      );
    }

    return <Navigate to={getSettingsPath(SettingsPath.ProfilePage)} replace />;
  }

  return children ?? <Outlet />;
};

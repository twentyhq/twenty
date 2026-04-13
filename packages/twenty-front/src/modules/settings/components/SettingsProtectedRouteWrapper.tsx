import { useHasAccessTokenPair } from '@/auth/hooks/useHasAccessTokenPair';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { settingsRedirectPathState } from '@/app/states/settingsRedirectPathState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { type ReactNode, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
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
  const hasAccessTokenPair = useHasAccessTokenPair();
  const hasPermission = useHasPermissionFlag(settingsPermission);
  const requiredFeatureFlagEnabled = useIsFeatureEnabled(
    requiredFeatureFlag || null,
  );
  const setSettingsRedirectPath = useSetAtomState(settingsRedirectPathState);

  const shouldRedirect =
    (requiredFeatureFlag && !requiredFeatureFlagEnabled) || !hasPermission;

  useEffect(() => {
    if (!hasAccessTokenPair) {
      return;
    }
    if (shouldRedirect) {
      setSettingsRedirectPath(getSettingsPath(SettingsPath.ProfilePage));
      return;
    }
    setSettingsRedirectPath(undefined);
  }, [hasAccessTokenPair, setSettingsRedirectPath, shouldRedirect]);

  if (!hasAccessTokenPair) {
    return null;
  }

  if (shouldRedirect) {
    return null;
  }

  return children ?? <Outlet />;
};

import { useHasSettingsPermission } from '@/settings/roles/hooks/useHasSettingsPermission';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { ReactNode } from 'react';
import { isDefined } from 'twenty-shared';
import { FeatureFlagKey, SettingsFeatures } from '~/generated/graphql';

export type SettingsNavigationItemWrapperProps = {
  children: ReactNode;
  settingsPermission?: SettingsFeatures;
  requiredFeatureFlag?: FeatureFlagKey;
};

export const SettingsNavigationItemWrapper = ({
  children,
  settingsPermission,
  requiredFeatureFlag,
}: SettingsNavigationItemWrapperProps) => {
  const isPermissionsEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IsPermissionsEnabled,
  );
  const hasPermission = useHasSettingsPermission(settingsPermission);
  const requiredFeatureFlagEnabled = useIsFeatureEnabled(
    requiredFeatureFlag || null,
  );

  if (
    (isDefined(requiredFeatureFlag) && !requiredFeatureFlagEnabled) ||
    (!hasPermission && isPermissionsEnabled)
  ) {
    return null;
  }

  return <>{children}</>;
};

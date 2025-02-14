import { useHasSettingsPermission } from '@/settings/roles/hooks/useHasSettingsPermission';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { ReactNode } from 'react';
import { FeatureFlagKey, SettingsFeatures } from '~/generated/graphql';

export type SettingsNavigationItemWrapperProps = {
  children: ReactNode;
  feature: SettingsFeatures;
  requiredFeatureFlag?: FeatureFlagKey;
};

export const SettingsNavigationItemWrapper = ({
  children,
  feature,
  requiredFeatureFlag,
}: SettingsNavigationItemWrapperProps) => {
  const isPermissionsEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IsPermissionsEnabled,
  );
  const hasPermission = useHasSettingsPermission(feature);
  const requiredFeatureFlagEnabled = useIsFeatureEnabled(
    requiredFeatureFlag || null,
  );

  if (
    (requiredFeatureFlag && !requiredFeatureFlagEnabled) ||
    (!hasPermission && isPermissionsEnabled)
  ) {
    return null;
  }

  return <>{children}</>;
};

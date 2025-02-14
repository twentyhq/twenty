import { useHasSettingsPermission } from '@/settings/roles/hooks/useHasSettingsPermission';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { ReactNode } from 'react';
import { FeatureFlagKey, SettingsFeatures } from '~/generated/graphql';

type SettingsNavigationItemWrapperProps = {
  children: ReactNode;
  feature: SettingsFeatures;
  requiresFeatureFlag?: FeatureFlagKey;
};

export const SettingsNavigationItemWrapper = ({
  children,
  feature,
  requiresFeatureFlag,
}: SettingsNavigationItemWrapperProps) => {
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
    return null;
  }

  return <>{children}</>;
};

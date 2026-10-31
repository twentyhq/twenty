import { useEnabledBuiltInAccountApps } from '@/settings/app-preferences/hooks/useEnabledBuiltInAccountApps';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useInstalledBuiltInAccountApps = () => {
  const isAppPreferencesEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
  );
  const { enabledBuiltInAccountApps } = useEnabledBuiltInAccountApps();

  return isAppPreferencesEnabled ? enabledBuiltInAccountApps : [];
};

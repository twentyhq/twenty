import { BUILT_IN_MCP_CLIENT_APPS } from '@/settings/app-preferences/constants/BuiltInMcpClientApps';
import { useEnabledBuiltInAccountApps } from '@/settings/app-preferences/hooks/useEnabledBuiltInAccountApps';
import { type BuiltInApp } from '@/settings/app-preferences/types/BuiltInApp';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useInstalledBuiltInApps = (): BuiltInApp[] => {
  const isAppPreferencesEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
  );
  const { enabledBuiltInAccountApps } = useEnabledBuiltInAccountApps();

  return isAppPreferencesEnabled
    ? [...enabledBuiltInAccountApps, ...BUILT_IN_MCP_CLIENT_APPS]
    : [];
};

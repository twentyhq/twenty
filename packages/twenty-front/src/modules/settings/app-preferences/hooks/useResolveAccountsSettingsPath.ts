import { APP_PREFERENCES_PATH_BY_LEGACY_ACCOUNTS_PATH } from '@/settings/app-preferences/constants/AppPreferencesPathByLegacyAccountsPath';
import { type LegacyAccountsSettingsPath } from '@/settings/app-preferences/types/LegacyAccountsSettingsPath';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useCallback } from 'react';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useResolveAccountsSettingsPath = () => {
  const isAppPreferencesEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
  );

  const resolveAccountsSettingsPath = useCallback(
    <TLegacyAccountsSettingsPath extends LegacyAccountsSettingsPath>(
      legacyAccountsSettingsPath: TLegacyAccountsSettingsPath,
    ) =>
      isAppPreferencesEnabled
        ? APP_PREFERENCES_PATH_BY_LEGACY_ACCOUNTS_PATH[
            legacyAccountsSettingsPath
          ]
        : legacyAccountsSettingsPath,
    [isAppPreferencesEnabled],
  );

  return { resolveAccountsSettingsPath };
};

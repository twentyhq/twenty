import { useInstalledApplications } from '@/applications/hooks/useInstalledApplications';
import { useEnabledNativeAccountApps } from '@/settings/app-preferences/hooks/useEnabledNativeAccountApps';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { SettingsApplicationsTable } from '~/pages/settings/applications/components/SettingsApplicationsTable';

export const SettingsApplicationsInstalledTab = () => {
  const installedApplications = useInstalledApplications();
  const isAppPreferencesEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
  );
  const { enabledNativeAccountApps } = useEnabledNativeAccountApps();

  const nativeAccountApps = isAppPreferencesEnabled
    ? enabledNativeAccountApps
    : [];

  if (installedApplications.length === 0 && nativeAccountApps.length === 0) {
    return null;
  }

  return (
    <SettingsApplicationsTable
      applications={installedApplications}
      nativeAccountApps={nativeAccountApps}
    />
  );
};

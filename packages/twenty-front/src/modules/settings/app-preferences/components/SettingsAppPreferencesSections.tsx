import { SettingsAccountsBlocklistSection } from '@/settings/accounts/components/SettingsAccountsBlocklistSection';
import { SettingsAccountGroupsSection } from '@/settings/app-preferences/components/SettingsAccountGroupsSection';
import { SettingsAppPreferencesAppsSection } from '@/settings/app-preferences/components/SettingsAppPreferencesAppsSection';
import { useApplicationsWithPreferences } from '@/settings/app-preferences/hooks/useApplicationsWithPreferences';
import { useEnabledNativeAccountApps } from '@/settings/app-preferences/hooks/useEnabledNativeAccountApps';

export const SettingsAppPreferencesSections = () => {
  const { enabledNativeAccountApps } = useEnabledNativeAccountApps();
  const { applicationsWithPreferences } = useApplicationsWithPreferences();

  const hasNativeAccountApps = enabledNativeAccountApps.length > 0;

  return (
    <>
      <SettingsAccountGroupsSection />
      {(hasNativeAccountApps || applicationsWithPreferences.length > 0) && (
        <SettingsAppPreferencesAppsSection />
      )}
      {/* The blocklist otherwise lives on the native apps' pages */}
      {!hasNativeAccountApps && <SettingsAccountsBlocklistSection />}
    </>
  );
};

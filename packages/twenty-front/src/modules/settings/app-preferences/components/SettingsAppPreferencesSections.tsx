import { SettingsAccountsBlocklistSection } from '@/settings/accounts/components/SettingsAccountsBlocklistSection';
import { SettingsAccountGroupsSection } from '@/settings/app-preferences/components/SettingsAccountGroupsSection';
import { SettingsAppPreferencesAppsSection } from '@/settings/app-preferences/components/SettingsAppPreferencesAppsSection';
import { useApplicationsWithPreferences } from '@/settings/app-preferences/hooks/useApplicationsWithPreferences';
import { useEnabledNativeAccountApps } from '@/settings/app-preferences/hooks/useEnabledNativeAccountApps';
import { isNonEmptyArray } from 'twenty-shared/utils';

export const SettingsAppPreferencesSections = () => {
  const { enabledNativeAccountApps } = useEnabledNativeAccountApps();
  const { applicationsWithPreferences } = useApplicationsWithPreferences();

  const hasNativeAccountApps = isNonEmptyArray(enabledNativeAccountApps);

  return (
    <>
      <SettingsAccountGroupsSection />
      {(hasNativeAccountApps ||
        isNonEmptyArray(applicationsWithPreferences)) && (
        <SettingsAppPreferencesAppsSection />
      )}
      {/* The blocklist otherwise lives on the native apps' pages */}
      {!hasNativeAccountApps && <SettingsAccountsBlocklistSection />}
    </>
  );
};

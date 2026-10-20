import { SettingsAccountsBlocklistSection } from '@/settings/accounts/components/SettingsAccountsBlocklistSection';
import { SettingsAccountGroupsSection } from '@/settings/app-preferences/components/SettingsAccountGroupsSection';
import { SettingsAppPreferencesAppsSection } from '@/settings/app-preferences/components/SettingsAppPreferencesAppsSection';
import { useApplicationsWithPreferences } from '@/settings/app-preferences/hooks/useApplicationsWithPreferences';
import { useEnabledBuiltInAccountApps } from '@/settings/app-preferences/hooks/useEnabledBuiltInAccountApps';
import { isNonEmptyArray } from 'twenty-shared/utils';

export const SettingsAppPreferencesSections = () => {
  const { enabledBuiltInAccountApps } = useEnabledBuiltInAccountApps();
  const { applicationsWithPreferences, hasApplicationsLoadError } =
    useApplicationsWithPreferences();

  const hasBuiltInAccountApps = isNonEmptyArray(enabledBuiltInAccountApps);

  return (
    <>
      <SettingsAccountGroupsSection />
      {(hasBuiltInAccountApps ||
        isNonEmptyArray(applicationsWithPreferences) ||
        hasApplicationsLoadError) && <SettingsAppPreferencesAppsSection />}
      {!hasBuiltInAccountApps && <SettingsAccountsBlocklistSection />}
    </>
  );
};

import { SettingsAccountsBlocklistSection } from '@/settings/accounts/components/SettingsAccountsBlocklistSection';
import { SettingsAccountGroupsSection } from '@/settings/app-preferences/components/SettingsAccountGroupsSection';
import { SettingsNativeAccountAppsSection } from '@/settings/app-preferences/components/SettingsNativeAccountAppsSection';
import { useEnabledNativeAccountApps } from '@/settings/app-preferences/hooks/useEnabledNativeAccountApps';

export const SettingsAppPreferencesSections = () => {
  const { enabledNativeAccountApps } = useEnabledNativeAccountApps();

  return (
    <>
      <SettingsAccountGroupsSection />
      {enabledNativeAccountApps.length > 0 ? (
        <SettingsNativeAccountAppsSection />
      ) : (
        <SettingsAccountsBlocklistSection />
      )}
    </>
  );
};

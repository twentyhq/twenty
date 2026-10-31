import { SettingsAccountsBlocklistSection } from '@/settings/accounts/components/SettingsAccountsBlocklistSection';
import { SettingsAccountGroupsSection } from '@/settings/app-preferences/components/SettingsAccountGroupsSection';
import { useEnabledBuiltInAccountApps } from '@/settings/app-preferences/hooks/useEnabledBuiltInAccountApps';
import { isNonEmptyArray } from 'twenty-shared/utils';

export const SettingsAppPreferencesAccountsTab = () => {
  const { enabledBuiltInAccountApps } = useEnabledBuiltInAccountApps();

  return (
    <>
      <SettingsAccountGroupsSection />
      {!isNonEmptyArray(enabledBuiltInAccountApps) && (
        <SettingsAccountsBlocklistSection />
      )}
    </>
  );
};

import { SettingsAccountsListEmptyStateCard } from '@/settings/accounts/components/SettingsAccountsListEmptyStateCard';
import { SettingsAppPreferencesListEmptyStateCard } from '@/settings/app-preferences/components/SettingsAppPreferencesListEmptyStateCard';
import { type BuiltInAccountApp } from '@/settings/app-preferences/types/BuiltInAccountApp';
import { isDefined } from 'twenty-shared/utils';

type SettingsAccountGroupsEmptyStateProps = {
  builtInAccountApp?: BuiltInAccountApp;
};

export const SettingsAccountGroupsEmptyState = ({
  builtInAccountApp,
}: SettingsAccountGroupsEmptyStateProps) => {
  if (isDefined(builtInAccountApp)) {
    return (
      <SettingsAppPreferencesListEmptyStateCard
        provider={builtInAccountApp.provider}
      />
    );
  }

  return <SettingsAccountsListEmptyStateCard />;
};

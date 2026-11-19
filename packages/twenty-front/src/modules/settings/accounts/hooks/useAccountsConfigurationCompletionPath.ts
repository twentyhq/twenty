import { useMyConnectedAccounts } from '@/settings/accounts/hooks/useMyConnectedAccounts';
import { BUILT_IN_ACCOUNT_APPS } from '@/settings/app-preferences/constants/BuiltInAccountApps';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';

export const useAccountsConfigurationCompletionPath = (
  connectedAccountId?: string,
) => {
  const { accounts } = useMyConnectedAccounts();

  const connectedAccount = accounts.find(
    (account) => account.id === connectedAccountId,
  );
  const builtInAccountApp = BUILT_IN_ACCOUNT_APPS.find(
    (app) => app.provider === connectedAccount?.provider,
  );

  if (isDefined(builtInAccountApp)) {
    return getSettingsPath(SettingsPath.AppPreferencesApp, {
      applicationId: builtInAccountApp.id,
    });
  }

  return getSettingsPath(SettingsPath.AppPreferences);
};

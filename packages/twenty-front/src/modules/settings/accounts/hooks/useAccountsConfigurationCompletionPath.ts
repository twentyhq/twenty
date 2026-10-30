import { useMyConnectedAccounts } from '@/settings/accounts/hooks/useMyConnectedAccounts';
import { BUILT_IN_ACCOUNT_APPS } from '@/settings/app-preferences/constants/BuiltInAccountApps';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useAccountsConfigurationCompletionPath = (
  connectedAccountId?: string,
) => {
  const isAppPreferencesEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
  );
  const { accounts } = useMyConnectedAccounts();

  const connectedAccount = accounts.find(
    (account) => account.id === connectedAccountId,
  );
  const builtInAccountApp = BUILT_IN_ACCOUNT_APPS.find(
    (app) => app.provider === connectedAccount?.provider,
  );

  if (isAppPreferencesEnabled && isDefined(builtInAccountApp)) {
    return getSettingsPath(SettingsPath.BuiltInAccountApp, {
      builtInAccountAppId: builtInAccountApp.id,
    });
  }

  return getSettingsPath(SettingsPath.Accounts);
};

import { useMyAccountGroups } from '@/settings/app-preferences/hooks/useMyAccountGroups';
import { type AppPreferencesRow } from '@/settings/app-preferences/types/AppPreferencesRow';
import { getBuiltInAccountAppsUsingAccount } from '@/settings/app-preferences/utils/getBuiltInAccountAppsUsingAccount';
import { isApplicationConnectionReconnectNeeded } from '@/settings/applications/utils/isApplicationConnectionReconnectNeeded';
import { useLingui } from '@lingui/react/macro';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Status } from 'twenty-ui/primitives/data-display';

type SettingsAppPreferencesAppStatusCellProps = {
  item: AppPreferencesRow;
};

export const SettingsAppPreferencesAppStatusCell = ({
  item,
}: SettingsAppPreferencesAppStatusCellProps) => {
  const { t } = useLingui();
  const { groups, loading } = useMyAccountGroups();

  if (item.type === 'installed') {
    const { missingRequiredVariables, connectionProviders } =
      item.applicationWithPreferences;

    if (isNonEmptyArray(missingRequiredVariables)) {
      return <Status color="red">{t`Missing configuration`}</Status>;
    }

    // Matches the Connections tab, which only offers Reconnect once OAuth is set up
    const reconnectableProviderIds = new Set(
      connectionProviders
        .filter(({ oauth }) => oauth?.isClientCredentialsConfigured ?? false)
        .map(({ id }) => id),
    );

    const hasConnectionNeedingReconnect = groups.some((group) =>
      group.appAccounts.some(
        (account) =>
          isDefined(account.connectionProviderId) &&
          reconnectableProviderIds.has(account.connectionProviderId) &&
          isApplicationConnectionReconnectNeeded(account),
      ),
    );

    return hasConnectionNeedingReconnect ? (
      <Status color="red">{t`Reconnect needed`}</Status>
    ) : null;
  }

  const hasAccount = groups.some((group) =>
    getBuiltInAccountAppsUsingAccount(group.builtInAccount).some(
      (app) => app.id === item.builtInAccountApp.id,
    ),
  );

  if (loading || hasAccount) {
    return null;
  }

  return <Status color="red">{t`Missing account`}</Status>;
};

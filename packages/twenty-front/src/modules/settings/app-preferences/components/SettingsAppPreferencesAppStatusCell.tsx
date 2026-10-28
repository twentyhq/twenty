import { SettingsConnectedAccountSyncStatus } from '@/settings/app-preferences/components/SettingsConnectedAccountSyncStatus';
import { useMyAccountGroups } from '@/settings/app-preferences/hooks/useMyAccountGroups';
import { type AppPreferencesRow } from '@/settings/app-preferences/types/AppPreferencesRow';
import { getBuiltInAccountAppsUsingAccount } from '@/settings/app-preferences/utils/getBuiltInAccountAppsUsingAccount';
import { SyncStatus } from '@/settings/accounts/constants/SyncStatus';
import { computeSyncStatus } from '@/settings/accounts/utils/computeSyncStatus';
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

  if (loading) {
    return null;
  }

  if (item.type === 'builtIn') {
    const activeAccounts = groups
      .map((group) => group.builtInAccount)
      .filter(isDefined)
      .filter(
        (account) =>
          !isDefined(account.archivedAt) &&
          getBuiltInAccountAppsUsingAccount(account).some(
            (app) => app.id === item.builtInAccountApp.id,
          ),
      );
    const findAccountWithStatus = (status: SyncStatus) =>
      activeAccounts.find(
        (account) =>
          computeSyncStatus(
            account.messageChannels[0],
            account.calendarChannels[0],
          ) === status,
      );
    const brokenAccount =
      findAccountWithStatus(SyncStatus.FAILED) ??
      findAccountWithStatus(SyncStatus.PENDING_CONFIGURATION);

    if (!isDefined(brokenAccount)) {
      return null;
    }

    return <SettingsConnectedAccountSyncStatus account={brokenAccount} />;
  }

  const { application, connectionProviders, missingRequiredVariables } =
    item.applicationWithPreferences;
  const activeConnections = groups.flatMap((group) =>
    group.appAccounts.filter(
      (account) =>
        account.applicationId === application.id &&
        !isDefined(account.archivedAt),
    ),
  );

  if (activeConnections.some(isApplicationConnectionReconnectNeeded)) {
    return <Status color="red">{t`Reconnect needed`}</Status>;
  }

  const isAppInUse =
    !isNonEmptyArray(connectionProviders) || isNonEmptyArray(activeConnections);

  if (!isAppInUse || !isNonEmptyArray(missingRequiredVariables)) {
    return null;
  }

  return <Status color="red">{t`Missing configuration`}</Status>;
};

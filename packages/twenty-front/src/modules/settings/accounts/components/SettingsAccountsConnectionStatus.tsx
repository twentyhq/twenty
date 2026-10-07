import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { SyncStatus } from '@/settings/accounts/constants/SyncStatus';
import { computeSyncStatus } from '@/settings/accounts/utils/computeSyncStatus';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { Status } from 'twenty-ui/primitives/data-display';

type SettingsAccountsConnectionStatusProps = {
  account: ConnectedAccount;
};

export const SettingsAccountsConnectionStatus = ({
  account,
}: SettingsAccountsConnectionStatusProps) => {
  const status = computeSyncStatus(
    account.messageChannels[0],
    account.calendarChannels[0],
  );

  // Archived accounts retain their synced data but cannot sync until reconnected.
  if (isDefined(account.archivedAt)) {
    return <Status color="gray" weight="medium">{t`Sync paused`}</Status>;
  }

  return (
    <>
      {status === SyncStatus.FAILED && (
        <Status color="red" weight="medium">{t`Sync failed`}</Status>
      )}
      {status === SyncStatus.SYNCED && (
        <Status color="green" weight="medium">{t`Synced`}</Status>
      )}
      {status === SyncStatus.NOT_SYNCED && (
        <Status color="orange" weight="medium">{t`Not synced`}</Status>
      )}
      {status === SyncStatus.IMPORTING && (
        <Status
          color="turquoise"
          weight="medium"
          loading
        >{t`Importing`}</Status>
      )}
      {status === SyncStatus.PENDING_CONFIGURATION && (
        <Status color="orange" weight="medium">{t`Setup incomplete`}</Status>
      )}
    </>
  );
};

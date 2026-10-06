import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { SyncStatus } from '@/settings/accounts/constants/SyncStatus';
import { computeSyncStatus } from '@/settings/accounts/utils/computeSyncStatus';
import { useLingui } from '@lingui/react/macro';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Status } from 'twenty-ui/primitives/data-display';

type SettingsAppPreferencesAccountStatusProps = {
  account: ConnectedAccount;
};

// Only accounts needing attention carry a status: a healthy row shows nothing.
export const SettingsAppPreferencesAccountStatus = ({
  account,
}: SettingsAppPreferencesAccountStatusProps) => {
  const { t } = useLingui();

  // An account connected through an app's own OAuth provider has no sync
  // channel, so its only state is the credential's.
  if (account.provider === ConnectedAccountProvider.APP) {
    return isDefined(account.authFailedAt) ? (
      <Status color="red" weight="medium">{t`Reconnect needed`}</Status>
    ) : null;
  }

  // Archived accounts retain their synced data but cannot be synced until they
  // are reconnected, so the live sync status is no longer relevant.
  if (isDefined(account.archivedAt)) {
    return <Status color="gray" weight="medium">{t`Sync paused`}</Status>;
  }

  const status = computeSyncStatus(
    account.messageChannels[0],
    account.calendarChannels[0],
  );

  switch (status) {
    case SyncStatus.FAILED:
      return <Status color="red" weight="medium">{t`Sync failed`}</Status>;
    case SyncStatus.NOT_SYNCED:
      return <Status color="orange" weight="medium">{t`Not synced`}</Status>;
    case SyncStatus.IMPORTING:
      return (
        <Status color="turquoise" weight="medium" loading>
          {t`Importing`}
        </Status>
      );
    case SyncStatus.PENDING_CONFIGURATION:
      return (
        <Status color="orange" weight="medium">{t`Setup incomplete`}</Status>
      );
    case SyncStatus.SYNCED:
      return null;
  }
};

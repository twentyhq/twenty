import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { SyncStatus } from '@/settings/accounts/constants/SyncStatus';
import { computeSyncStatus } from '@/settings/accounts/utils/computeSyncStatus';
import { useLingui } from '@lingui/react/macro';
import { MAIL_SERVER_CERTIFICATE_INVALID_AUTH_FAILED_REASON } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { Status } from 'twenty-ui/primitives/data-display';

type SettingsConnectedAccountSyncStatusProps = {
  account: Pick<
    ConnectedAccount,
    'archivedAt' | 'authFailedReason' | 'messageChannels' | 'calendarChannels'
  >;
};

export const SettingsConnectedAccountSyncStatus = ({
  account,
}: SettingsConnectedAccountSyncStatusProps) => {
  const { t } = useLingui();

  if (isDefined(account.archivedAt)) {
    return <Status color="gray" weight="medium">{t`Sync paused`}</Status>;
  }

  const messageChannel = account.messageChannels[0];
  const importProgress = messageChannel?.importProgress;

  switch (computeSyncStatus(messageChannel, account.calendarChannels[0])) {
    case SyncStatus.FAILED:
      return account.authFailedReason ===
        MAIL_SERVER_CERTIFICATE_INVALID_AUTH_FAILED_REASON ? (
        <Status color="red" weight="medium">{t`Certificate invalid`}</Status>
      ) : (
        <Status color="red" weight="medium">{t`Sync failed`}</Status>
      );
    case SyncStatus.SYNCED:
      return <Status color="green" weight="medium">{t`Synced`}</Status>;
    case SyncStatus.NOT_SYNCED:
      return <Status color="orange" weight="medium">{t`Not synced`}</Status>;
    case SyncStatus.IMPORTING:
      return (
        <Status color="turquoise" weight="medium" loading>
          {isDefined(importProgress)
            ? t`Importing ${importProgress}%`
            : t`Importing`}
        </Status>
      );
    case SyncStatus.PENDING_CONFIGURATION:
      return (
        <Status color="orange" weight="medium">{t`Setup incomplete`}</Status>
      );
  }
};

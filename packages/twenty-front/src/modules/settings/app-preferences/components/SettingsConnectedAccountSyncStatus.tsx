import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { SyncStatus } from '@/settings/accounts/constants/SyncStatus';
import { computeSyncStatus } from '@/settings/accounts/utils/computeSyncStatus';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Status } from 'twenty-ui/primitives/data-display';

type SettingsConnectedAccountSyncStatusProps = {
  account: Pick<
    ConnectedAccount,
    'archivedAt' | 'messageChannels' | 'calendarChannels'
  >;
};

export const SettingsConnectedAccountSyncStatus = ({
  account,
}: SettingsConnectedAccountSyncStatusProps) => {
  const { t } = useLingui();

  if (isDefined(account.archivedAt)) {
    return <Status color="gray" weight="medium">{t`Sync paused`}</Status>;
  }

  switch (
    computeSyncStatus(account.messageChannels[0], account.calendarChannels[0])
  ) {
    case SyncStatus.FAILED:
      return <Status color="red" weight="medium">{t`Sync failed`}</Status>;
    case SyncStatus.SYNCED:
      return <Status color="green" weight="medium">{t`Synced`}</Status>;
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
  }
};

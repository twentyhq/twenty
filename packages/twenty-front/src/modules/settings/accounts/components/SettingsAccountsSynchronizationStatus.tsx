import { MessageChannelSyncStatus } from '@/accounts/types/MessageChannel';
import { Status } from '@/ui/display/status/components/Status';

export type SettingsAccountsSynchronizationStatusProps = {
  syncStatus: MessageChannelSyncStatus;
};

const getColor = (syncStatus?: MessageChannelSyncStatus | null) => {
  switch (syncStatus) {
    case MessageChannelSyncStatus.FAILED:
      return 'red';
    case MessageChannelSyncStatus.PENDING:
      return 'gray';
    case MessageChannelSyncStatus.ONGOING:
      return 'yellow';
    case MessageChannelSyncStatus.SUCCEEDED:
      return 'green';
    default:
      return 'gray';
  }
};

const getText = (syncStatus?: MessageChannelSyncStatus | null) => {
  switch (syncStatus) {
    case MessageChannelSyncStatus.FAILED:
      return 'Sync failed';
    case MessageChannelSyncStatus.PENDING:
      return 'Sync pending';
    case MessageChannelSyncStatus.ONGOING:
      return 'Syncing';
    case MessageChannelSyncStatus.SUCCEEDED:
      return 'Synced';
    default:
      return 'Sync pending';
  }
};

export const SettingsAccountsSynchronizationStatus = ({
  syncStatus,
}: SettingsAccountsSynchronizationStatusProps) => (
  <Status
    color={getColor(syncStatus)}
    text={getText(syncStatus)}
    weight="medium"
  />
);

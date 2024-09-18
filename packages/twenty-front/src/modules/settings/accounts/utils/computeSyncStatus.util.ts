import { CalendarChannelSyncStatus } from '@/accounts/types/CalendarChannel';
import { MessageChannelSyncStatus } from '@/accounts/types/MessageChannel';
import { SyncStatus } from '@/settings/accounts/enums/syncStatus.enum';

export const computeSyncStatus = (
  messageChannelSyncStatus: MessageChannelSyncStatus,
  calendarChannelSyncStatus: CalendarChannelSyncStatus,
) => {
  switch (true) {
    case messageChannelSyncStatus === MessageChannelSyncStatus.FAILED_UNKNOWN ||
      messageChannelSyncStatus ===
        MessageChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS ||
      calendarChannelSyncStatus === CalendarChannelSyncStatus.FAILED_UNKNOWN ||
      calendarChannelSyncStatus ===
        CalendarChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS:
      return SyncStatus.FAILED;
    case messageChannelSyncStatus === MessageChannelSyncStatus.ONGOING ||
      calendarChannelSyncStatus === CalendarChannelSyncStatus.ONGOING:
      return SyncStatus.IMPORTING;
    case messageChannelSyncStatus === MessageChannelSyncStatus.NOT_SYNCED &&
      calendarChannelSyncStatus === CalendarChannelSyncStatus.NOT_SYNCED:
      return SyncStatus.NOT_SYNCED;
    case messageChannelSyncStatus === MessageChannelSyncStatus.ACTIVE &&
      calendarChannelSyncStatus === CalendarChannelSyncStatus.ACTIVE:
      return SyncStatus.SYNCED;
    default:
      return SyncStatus.NOT_SYNCED;
  }
};

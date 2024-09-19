import { CalendarChannelSyncStatus } from '@/accounts/types/CalendarChannel';
import { MessageChannelSyncStatus } from '@/accounts/types/MessageChannel';
import { SyncStatus } from '@/settings/accounts/constants/SyncStatus';

export const computeSyncStatus = (
  messageChannelSyncStatus: MessageChannelSyncStatus,
  calendarChannelSyncStatus: CalendarChannelSyncStatus,
) => {
  if (
    messageChannelSyncStatus === MessageChannelSyncStatus.FAILED_UNKNOWN ||
    messageChannelSyncStatus ===
      MessageChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS ||
    calendarChannelSyncStatus === CalendarChannelSyncStatus.FAILED_UNKNOWN ||
    calendarChannelSyncStatus ===
      CalendarChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS
  ) {
    return SyncStatus.FAILED;
  }

  if (
    messageChannelSyncStatus === MessageChannelSyncStatus.ONGOING ||
    calendarChannelSyncStatus === CalendarChannelSyncStatus.ONGOING
  ) {
    return SyncStatus.IMPORTING;
  }

  if (
    messageChannelSyncStatus === MessageChannelSyncStatus.NOT_SYNCED &&
    calendarChannelSyncStatus === CalendarChannelSyncStatus.NOT_SYNCED
  ) {
    return SyncStatus.NOT_SYNCED;
  }

  if (
    messageChannelSyncStatus === MessageChannelSyncStatus.ACTIVE ||
    calendarChannelSyncStatus === CalendarChannelSyncStatus.ACTIVE
  ) {
    return SyncStatus.SYNCED;
  }

  return SyncStatus.NOT_SYNCED;
};

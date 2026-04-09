import {
  type CalendarChannel,
  CalendarChannelSyncStage,
  CalendarChannelSyncStatus,
} from '@/accounts/types/CalendarChannel';
import {
  type MessageChannel,
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
} from '@/accounts/types/MessageChannel';
import { SyncStatus } from '@/settings/accounts/constants/SyncStatus';

export const computeSyncStatus = (
  messageChannel?: Pick<MessageChannel, 'syncStatus' | 'syncStage'>,
  calendarChannel?: Pick<CalendarChannel, 'syncStatus' | 'syncStage'>,
): SyncStatus => {
  const {
    syncStatus: messageChannelSyncStatus,
    syncStage: messageChannelSyncStage,
  } = messageChannel ?? {};

  const {
    syncStatus: calendarChannelSyncStatus,
    syncStage: calendarChannelSyncStage,
  } = calendarChannel ?? {};

  if (
    messageChannelSyncStage === MessageChannelSyncStage.PENDING_CONFIGURATION ||
    calendarChannelSyncStage === CalendarChannelSyncStage.PENDING_CONFIGURATION
  ) {
    return SyncStatus.PENDING_CONFIGURATION;
  }

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

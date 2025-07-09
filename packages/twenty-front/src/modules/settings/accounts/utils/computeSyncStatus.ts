import { CalendarChannelSyncStatus } from '@/accounts/types/CalendarChannel';
import { ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { MessageChannelSyncStatus } from '@/accounts/types/MessageChannel';
import { SyncStatus } from '@/settings/accounts/constants/SyncStatus';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const computeSyncStatus = (
  connectedAccount: ConnectedAccount,
  messageChannelSyncStatus: MessageChannelSyncStatus,
  calendarChannelSyncStatus: CalendarChannelSyncStatus,
  isMessageChannelSyncEnabled?: boolean,
) => {
  if (isMessageChannelSyncEnabled === false) {
    return null;
  }
  if (
    connectedAccount.provider === ConnectedAccountProvider.IMAP_SMTP_CALDAV &&
    isDefined(connectedAccount.connectionParameters?.SMTP) &&
    !isDefined(connectedAccount.connectionParameters?.IMAP) &&
    !isDefined(connectedAccount.connectionParameters?.CALDAV)
  ) {
    return null;
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

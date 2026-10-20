import { type CalendarChannel } from '@/accounts/types/CalendarChannel';
import { type MessageChannel } from '@/accounts/types/MessageChannel';
import {
  CalendarChannelSyncStage,
  MessageChannelSyncStage,
  MessageChannelType,
} from 'twenty-shared/types';

export const getConnectedAccountSettingsChannels = <
  TMessageChannel extends Pick<MessageChannel, 'type' | 'syncStage'>,
  TCalendarChannel extends Pick<CalendarChannel, 'syncStage'>,
>(
  account:
    | {
        messageChannels: TMessageChannel[];
        calendarChannels: TCalendarChannel[];
      }
    | undefined,
) => {
  const mailboxes =
    account?.messageChannels.filter(
      (channel) => channel.type === MessageChannelType.EMAIL,
    ) ?? [];
  const calendars = account?.calendarChannels ?? [];

  return {
    messageChannel: mailboxes.find(
      (channel) =>
        channel.syncStage !== MessageChannelSyncStage.PENDING_CONFIGURATION,
    ),
    calendarChannel: calendars.find(
      (channel) =>
        channel.syncStage !== CalendarChannelSyncStage.PENDING_CONFIGURATION,
    ),
    pendingSetupMessageChannel: mailboxes.find(
      (channel) =>
        channel.syncStage === MessageChannelSyncStage.PENDING_CONFIGURATION,
    ),
    pendingSetupCalendarChannel: calendars.find(
      (channel) =>
        channel.syncStage === CalendarChannelSyncStage.PENDING_CONFIGURATION,
    ),
  };
};

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
) => ({
  messageChannel: account?.messageChannels.find(
    (channel) =>
      channel.type === MessageChannelType.EMAIL &&
      channel.syncStage !== MessageChannelSyncStage.PENDING_CONFIGURATION,
  ),
  calendarChannel: account?.calendarChannels.find(
    (channel) =>
      channel.syncStage !== CalendarChannelSyncStage.PENDING_CONFIGURATION,
  ),
});

import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import {
  CalendarChannelSyncStage,
  MessageChannelSyncStage,
  MessageChannelType,
} from 'twenty-shared/types';

export const getAccountPreferenceChannels = ({
  messageChannels,
  calendarChannels,
}: Pick<ConnectedAccount, 'messageChannels' | 'calendarChannels'>) => ({
  messageChannels: messageChannels.filter(
    (channel) =>
      channel.type === MessageChannelType.EMAIL &&
      channel.isSyncEnabled &&
      channel.syncStage !== MessageChannelSyncStage.PENDING_CONFIGURATION,
  ),
  calendarChannels: calendarChannels.filter(
    (channel) =>
      channel.syncStage !== CalendarChannelSyncStage.PENDING_CONFIGURATION,
  ),
});

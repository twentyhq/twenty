import { getConnectedAccountPendingSetupChannels } from '@/settings/app-preferences/utils/getConnectedAccountPendingSetupChannels';
import {
  CalendarChannelSyncStage,
  MessageChannelSyncStage,
  MessageChannelType,
} from 'twenty-shared/types';

describe('getConnectedAccountPendingSetupChannels', () => {
  it('returns the mailbox and the calendar that still need setup', () => {
    const mailbox = {
      id: 'mailbox',
      type: MessageChannelType.EMAIL,
      syncStage: MessageChannelSyncStage.PENDING_CONFIGURATION,
    };
    const calendar = {
      id: 'calendar',
      syncStage: CalendarChannelSyncStage.PENDING_CONFIGURATION,
    };

    expect(
      getConnectedAccountPendingSetupChannels({
        messageChannels: [mailbox],
        calendarChannels: [calendar],
      }),
    ).toEqual({ messageChannel: mailbox, calendarChannel: calendar });
  });

  it('skips channels that are already set up', () => {
    expect(
      getConnectedAccountPendingSetupChannels({
        messageChannels: [
          {
            id: 'mailbox',
            type: MessageChannelType.EMAIL,
            syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
          },
        ],
        calendarChannels: [
          {
            id: 'calendar',
            syncStage:
              CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_PENDING,
          },
        ],
      }),
    ).toEqual({ messageChannel: undefined, calendarChannel: undefined });
  });

  it('skips message channels that are not mailboxes', () => {
    expect(
      getConnectedAccountPendingSetupChannels({
        messageChannels: [
          {
            id: 'group-inbox',
            type: MessageChannelType.EMAIL_GROUP,
            syncStage: MessageChannelSyncStage.PENDING_CONFIGURATION,
          },
        ],
        calendarChannels: [],
      }),
    ).toEqual({ messageChannel: undefined, calendarChannel: undefined });
  });

  it('returns nothing without an account', () => {
    expect(getConnectedAccountPendingSetupChannels(undefined)).toEqual({
      messageChannel: undefined,
      calendarChannel: undefined,
    });
  });
});

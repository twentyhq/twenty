import { getConnectedAccountSettingsChannels } from '@/settings/app-preferences/utils/getConnectedAccountSettingsChannels';
import {
  CalendarChannelSyncStage,
  MessageChannelSyncStage,
  MessageChannelType,
} from 'twenty-shared/types';

describe('getConnectedAccountSettingsChannels', () => {
  it('returns the mailbox and the calendar of the account', () => {
    const mailbox = {
      id: 'mailbox',
      type: MessageChannelType.EMAIL,
      syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
    };
    const calendar = {
      id: 'calendar',
      syncStage: CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_PENDING,
    };

    expect(
      getConnectedAccountSettingsChannels({
        messageChannels: [mailbox],
        calendarChannels: [calendar],
      }),
    ).toEqual({ messageChannel: mailbox, calendarChannel: calendar });
  });

  it('returns channels that still need setup separately', () => {
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
      getConnectedAccountSettingsChannels({
        messageChannels: [mailbox],
        calendarChannels: [calendar],
      }),
    ).toEqual({
      messageChannel: undefined,
      calendarChannel: undefined,
      pendingSetupMessageChannel: mailbox,
      pendingSetupCalendarChannel: calendar,
    });
  });

  it('skips message channels that are not mailboxes', () => {
    expect(
      getConnectedAccountSettingsChannels({
        messageChannels: [
          {
            id: 'group-inbox',
            type: MessageChannelType.EMAIL_GROUP,
            syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
          },
        ],
        calendarChannels: [],
      }),
    ).toEqual({ messageChannel: undefined, calendarChannel: undefined });
  });

  it('returns nothing when there is no account', () => {
    expect(getConnectedAccountSettingsChannels(undefined)).toEqual({
      messageChannel: undefined,
      calendarChannel: undefined,
    });
  });
});

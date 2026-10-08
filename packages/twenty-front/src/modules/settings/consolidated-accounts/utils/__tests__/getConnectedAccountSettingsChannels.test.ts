import { getConnectedAccountSettingsChannels } from '@/settings/consolidated-accounts/utils/getConnectedAccountSettingsChannels';
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

  it('skips channels that still need setup', () => {
    expect(
      getConnectedAccountSettingsChannels({
        messageChannels: [
          {
            id: 'mailbox',
            type: MessageChannelType.EMAIL,
            syncStage: MessageChannelSyncStage.PENDING_CONFIGURATION,
          },
        ],
        calendarChannels: [
          {
            id: 'calendar',
            syncStage: CalendarChannelSyncStage.PENDING_CONFIGURATION,
          },
        ],
      }),
    ).toEqual({ messageChannel: undefined, calendarChannel: undefined });
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

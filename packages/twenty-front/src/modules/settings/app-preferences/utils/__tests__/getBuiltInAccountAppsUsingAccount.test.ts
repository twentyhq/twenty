import { getBuiltInAccountAppsUsingAccount } from '@/settings/app-preferences/utils/getBuiltInAccountAppsUsingAccount';
import {
  CalendarChannelSyncStage,
  ConnectedAccountProvider,
  MessageChannelSyncStage,
  MessageChannelType,
} from 'twenty-shared/types';

const mailbox = {
  type: MessageChannelType.EMAIL,
  syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
};
const calendar = {
  syncStage: CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_PENDING,
};
const mailboxWaitingForSetup = {
  type: MessageChannelType.EMAIL,
  syncStage: MessageChannelSyncStage.PENDING_CONFIGURATION,
};
const groupInbox = {
  type: MessageChannelType.EMAIL_GROUP,
  syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
};

const getAppIds = (
  account: Parameters<typeof getBuiltInAccountAppsUsingAccount>[0],
) => getBuiltInAccountAppsUsingAccount(account).map((app) => app.id);

describe('getBuiltInAccountAppsUsingAccount', () => {
  it('lists Google once for a Google account with mail and calendar', () => {
    expect(
      getAppIds({
        provider: ConnectedAccountProvider.GOOGLE,
        messageChannels: [mailbox],
        calendarChannels: [calendar],
      }),
    ).toEqual(['google']);
  });

  it('lists Google for a Google account with only a calendar', () => {
    expect(
      getAppIds({
        provider: ConnectedAccountProvider.GOOGLE,
        messageChannels: [],
        calendarChannels: [calendar],
      }),
    ).toEqual(['google']);
  });

  it('counts channels that still need setup', () => {
    expect(
      getAppIds({
        provider: ConnectedAccountProvider.GOOGLE,
        messageChannels: [mailboxWaitingForSetup],
        calendarChannels: [],
      }),
    ).toEqual(['google']);
  });

  it('ignores message channels that are not mailboxes', () => {
    expect(
      getAppIds({
        provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
        messageChannels: [groupInbox],
        calendarChannels: [],
      }),
    ).toEqual([]);
  });

  it('lists Outlook once for a Microsoft account with mail and calendar', () => {
    expect(
      getAppIds({
        provider: ConnectedAccountProvider.MICROSOFT,
        messageChannels: [mailbox],
        calendarChannels: [calendar],
      }),
    ).toEqual(['outlook']);
  });

  it('lists Outlook for a Microsoft account with only mail', () => {
    expect(
      getAppIds({
        provider: ConnectedAccountProvider.MICROSOFT,
        messageChannels: [mailbox],
        calendarChannels: [],
      }),
    ).toEqual(['outlook']);
  });

  it('lists IMAP once for an IMAP account with mail and calendar', () => {
    expect(
      getAppIds({
        provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
        messageChannels: [mailbox],
        calendarChannels: [calendar],
      }),
    ).toEqual(['imap']);
  });

  it('lists nothing without an account or without channels', () => {
    expect(
      getAppIds({
        provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
        messageChannels: [],
        calendarChannels: [],
      }),
    ).toEqual([]);
    expect(getAppIds(undefined)).toEqual([]);
  });
});

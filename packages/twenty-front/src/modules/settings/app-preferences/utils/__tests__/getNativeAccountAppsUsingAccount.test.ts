import { getNativeAccountAppsUsingAccount } from '@/settings/app-preferences/utils/getNativeAccountAppsUsingAccount';
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
  account: Parameters<typeof getNativeAccountAppsUsingAccount>[0],
) => getNativeAccountAppsUsingAccount(account).map((app) => app.id);

describe('getNativeAccountAppsUsingAccount', () => {
  it('splits a Google account into Gmail and Google Calendar', () => {
    expect(
      getAppIds({
        provider: ConnectedAccountProvider.GOOGLE,
        messageChannels: [mailbox],
        calendarChannels: [calendar],
      }),
    ).toEqual(['gmail', 'google-calendar']);
  });

  it('only lists the Google apps whose channel exists', () => {
    expect(
      getAppIds({
        provider: ConnectedAccountProvider.GOOGLE,
        messageChannels: [],
        calendarChannels: [calendar],
      }),
    ).toEqual(['google-calendar']);
  });

  it('counts channels that still need setup', () => {
    expect(
      getAppIds({
        provider: ConnectedAccountProvider.GOOGLE,
        messageChannels: [mailboxWaitingForSetup],
        calendarChannels: [],
      }),
    ).toEqual(['gmail']);
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

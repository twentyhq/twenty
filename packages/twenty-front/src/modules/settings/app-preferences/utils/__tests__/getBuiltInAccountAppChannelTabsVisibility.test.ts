import { getBuiltInAccountAppChannelTabsVisibility } from '@/settings/app-preferences/utils/getBuiltInAccountAppChannelTabsVisibility';
import {
  CalendarChannelSyncStage,
  MessageChannelSyncStage,
  MessageChannelType,
} from 'twenty-shared/types';

const READY_MAILBOX = {
  type: MessageChannelType.EMAIL,
  syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
};
const PENDING_MAILBOX = {
  type: MessageChannelType.EMAIL,
  syncStage: MessageChannelSyncStage.PENDING_CONFIGURATION,
};
const READY_CALENDAR = {
  syncStage: CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_PENDING,
};
const PENDING_CALENDAR = {
  syncStage: CalendarChannelSyncStage.PENDING_CONFIGURATION,
};
const OUTLOOK = { hasEmails: true, hasCalendar: true };

describe('getBuiltInAccountAppChannelTabsVisibility', () => {
  it('shows the tabs the app supports when there are no accounts', () => {
    expect(
      getBuiltInAccountAppChannelTabsVisibility({
        app: OUTLOOK,
        accounts: [],
        isLoading: false,
      }),
    ).toEqual({
      isEmailsTabVisible: true,
      isCalendarTabVisible: true,
    });
  });

  it('hides the tabs the app does not support', () => {
    expect(
      getBuiltInAccountAppChannelTabsVisibility({
        app: { hasEmails: true, hasCalendar: false },
        accounts: [
          {
            messageChannels: [READY_MAILBOX],
            calendarChannels: [READY_CALENDAR],
          },
        ],
        isLoading: false,
      }),
    ).toEqual({ isEmailsTabVisible: true, isCalendarTabVisible: false });
  });

  it('hides a tab whose accounts are all pending setup', () => {
    expect(
      getBuiltInAccountAppChannelTabsVisibility({
        app: OUTLOOK,
        accounts: [
          {
            messageChannels: [READY_MAILBOX],
            calendarChannels: [PENDING_CALENDAR],
          },
        ],
        isLoading: true,
      }),
    ).toEqual({ isEmailsTabVisible: true, isCalendarTabVisible: false });
  });

  it('keeps a tab when one account is ready and another is pending setup', () => {
    expect(
      getBuiltInAccountAppChannelTabsVisibility({
        app: OUTLOOK,
        accounts: [
          { messageChannels: [PENDING_MAILBOX], calendarChannels: [] },
          {
            messageChannels: [READY_MAILBOX],
            calendarChannels: [READY_CALENDAR],
          },
        ],
        isLoading: false,
      }),
    ).toEqual({ isEmailsTabVisible: true, isCalendarTabVisible: true });
  });

  it('hides a tab once loaded when the accounts have no channel for it', () => {
    expect(
      getBuiltInAccountAppChannelTabsVisibility({
        app: OUTLOOK,
        accounts: [{ messageChannels: [READY_MAILBOX], calendarChannels: [] }],
        isLoading: false,
      }),
    ).toEqual({ isEmailsTabVisible: true, isCalendarTabVisible: false });
  });

  it('keeps a tab while channels may still be loading', () => {
    expect(
      getBuiltInAccountAppChannelTabsVisibility({
        app: OUTLOOK,
        accounts: [{ messageChannels: [], calendarChannels: [] }],
        isLoading: true,
      }),
    ).toEqual({ isEmailsTabVisible: true, isCalendarTabVisible: true });
  });

  it('hides every tab without an app', () => {
    expect(
      getBuiltInAccountAppChannelTabsVisibility({
        app: undefined,
        accounts: [],
        isLoading: false,
      }),
    ).toEqual({
      isEmailsTabVisible: false,
      isCalendarTabVisible: false,
    });
  });
});

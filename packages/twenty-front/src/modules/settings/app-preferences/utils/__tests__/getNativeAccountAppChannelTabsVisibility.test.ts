import { getNativeAccountAppChannelTabsVisibility } from '@/settings/app-preferences/utils/getNativeAccountAppChannelTabsVisibility';
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

describe('getNativeAccountAppChannelTabsVisibility', () => {
  it('shows the tabs the app supports when there are no accounts', () => {
    expect(
      getNativeAccountAppChannelTabsVisibility({ app: OUTLOOK, accounts: [] }),
    ).toEqual({
      isEmailsTabVisible: true,
      isCalendarTabVisible: true,
    });
  });

  it('hides the tabs the app does not support', () => {
    expect(
      getNativeAccountAppChannelTabsVisibility({
        app: { hasEmails: true, hasCalendar: false },
        accounts: [{ messageChannels: [], calendarChannels: [READY_CALENDAR] }],
      }),
    ).toEqual({ isEmailsTabVisible: true, isCalendarTabVisible: false });
  });

  it('hides a tab whose accounts are all pending setup', () => {
    expect(
      getNativeAccountAppChannelTabsVisibility({
        app: OUTLOOK,
        accounts: [
          {
            messageChannels: [READY_MAILBOX],
            calendarChannels: [PENDING_CALENDAR],
          },
        ],
      }),
    ).toEqual({ isEmailsTabVisible: true, isCalendarTabVisible: false });
  });

  it('keeps a tab when one account is ready and another is pending setup', () => {
    expect(
      getNativeAccountAppChannelTabsVisibility({
        app: OUTLOOK,
        accounts: [
          { messageChannels: [PENDING_MAILBOX], calendarChannels: [] },
          { messageChannels: [READY_MAILBOX], calendarChannels: [] },
        ],
      }),
    ).toEqual({ isEmailsTabVisible: true, isCalendarTabVisible: true });
  });

  it('hides every tab without an app', () => {
    expect(
      getNativeAccountAppChannelTabsVisibility({
        app: undefined,
        accounts: [],
      }),
    ).toEqual({
      isEmailsTabVisible: false,
      isCalendarTabVisible: false,
    });
  });
});

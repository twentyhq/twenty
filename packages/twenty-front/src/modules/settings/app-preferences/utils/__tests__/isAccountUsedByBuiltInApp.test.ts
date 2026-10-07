import { isAccountUsedByBuiltInApp } from '@/settings/app-preferences/utils/isAccountUsedByBuiltInApp';
import {
  ConnectedAccountProvider,
  MessageChannelType,
} from 'twenty-shared/types';
import {
  MOCKED_GOOGLE_CONNECTED_ACCOUNT,
  MOCKED_OUTLOOK_CALENDAR_ACCOUNT,
  MOCKED_PAUSED_GOOGLE_ACCOUNT,
} from '~/pages/settings/accounts/__stories__/mockedConnectedAccounts';

const GMAIL = {
  provider: ConnectedAccountProvider.GOOGLE,
  hasMessaging: true,
  hasCalendar: false,
};
const GOOGLE_CALENDAR = { ...GMAIL, hasMessaging: false, hasCalendar: true };

it('requires a real email channel for Gmail', () => {
  expect(
    isAccountUsedByBuiltInApp({
      account: MOCKED_GOOGLE_CONNECTED_ACCOUNT,
      builtInApp: GMAIL,
    }),
  ).toBe(true);
  expect(
    isAccountUsedByBuiltInApp({
      account: {
        ...MOCKED_GOOGLE_CONNECTED_ACCOUNT,
        messageChannels: [
          {
            ...MOCKED_GOOGLE_CONNECTED_ACCOUNT.messageChannels[0],
            type: MessageChannelType.APP,
          },
        ],
      },
      builtInApp: GMAIL,
    }),
  ).toBe(false);
});

it('recognizes calendar-only Outlook with messaging disabled', () => {
  expect(
    isAccountUsedByBuiltInApp({
      account: MOCKED_OUTLOOK_CALENDAR_ACCOUNT,
      builtInApp: {
        provider: ConnectedAccountProvider.MICROSOFT,
        hasMessaging: false,
        hasCalendar: true,
      },
    }),
  ).toBe(true);
});

it('does not use another provider connection even if its handle matches', () => {
  const account = {
    ...MOCKED_OUTLOOK_CALENDAR_ACCOUNT,
    handle: MOCKED_GOOGLE_CONNECTED_ACCOUNT.handle,
  };
  expect(
    isAccountUsedByBuiltInApp({
      account,
      builtInApp: GOOGLE_CALENDAR,
    }),
  ).toBe(false);
});

it('keeps a paused calendar connection associated with its app', () => {
  expect(
    isAccountUsedByBuiltInApp({
      account: MOCKED_PAUSED_GOOGLE_ACCOUNT,
      builtInApp: GOOGLE_CALENDAR,
    }),
  ).toBe(true);
  expect(
    isAccountUsedByBuiltInApp({
      account: MOCKED_PAUSED_GOOGLE_ACCOUNT,
      builtInApp: GMAIL,
    }),
  ).toBe(false);
});

it('does not infer usage from credentials with no channels', () => {
  expect(
    isAccountUsedByBuiltInApp({
      account: {
        provider: ConnectedAccountProvider.GOOGLE,
        messageChannels: [],
        calendarChannels: [],
      },
      builtInApp: GOOGLE_CALENDAR,
    }),
  ).toBe(false);
});

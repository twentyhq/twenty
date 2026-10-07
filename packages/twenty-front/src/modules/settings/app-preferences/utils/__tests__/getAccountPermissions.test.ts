import { GMAIL_COMPOSE_SCOPE } from '@/accounts/constants/GmailComposeScope';
import { GOOGLE_CALENDAR_EVENTS_SCOPE } from '@/accounts/constants/GoogleCalendarEventsScope';
import { MICROSOFT_CALENDARS_READ_WRITE_SCOPE } from '@/accounts/constants/MicrosoftCalendarsReadWriteScope';
import { MICROSOFT_SEND_SCOPE } from '@/accounts/constants/MicrosoftSendScope';
import { getAccountPermissions } from '@/settings/app-preferences/utils/getAccountPermissions';
import { ConnectedAccountProvider } from 'twenty-shared/types';

describe('getAccountPermissions', () => {
  it.each([
    { scopes: ['Mail.Read'], expected: ['Read emails'] },
    { scopes: ['Mail.ReadWrite'], expected: ['Read emails', 'Write emails'] },
    { scopes: [MICROSOFT_SEND_SCOPE], expected: ['Write emails'] },
    {
      scopes: [MICROSOFT_CALENDARS_READ_WRITE_SCOPE],
      expected: ['Read calendar', 'Write calendar'],
    },
    { scopes: ['Calendars.Read'], expected: ['Read calendar'] },
  ])(
    'summarizes only granted Microsoft permissions for $scopes',
    ({ scopes, expected }) => {
      expect(
        getAccountPermissions({
          provider: ConnectedAccountProvider.MICROSOFT,
          scopes,
          connectionParameters: null,
        }),
      ).toEqual(expected);
    },
  );

  it.each([
    {
      scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
      expected: ['Read emails'],
    },
    { scopes: [GMAIL_COMPOSE_SCOPE], expected: ['Write emails'] },
    {
      scopes: ['https://www.googleapis.com/auth/gmail.send'],
      expected: ['Write emails'],
    },
    {
      scopes: ['https://www.googleapis.com/auth/gmail.modify'],
      expected: ['Read emails', 'Write emails'],
    },
    {
      scopes: [GOOGLE_CALENDAR_EVENTS_SCOPE],
      expected: ['Read calendar', 'Write calendar'],
    },
    {
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
      expected: ['Read calendar'],
    },
  ])(
    'summarizes only granted Google permissions for $scopes',
    ({ scopes, expected }) => {
      expect(
        getAccountPermissions({
          provider: ConnectedAccountProvider.GOOGLE,
          scopes,
          connectionParameters: null,
        }),
      ).toEqual(expected);
    },
  );

  it('does not infer permissions from a provider when grants are unavailable', () => {
    expect(
      getAccountPermissions({
        provider: ConnectedAccountProvider.GOOGLE,
        scopes: null,
        connectionParameters: null,
      }),
    ).toEqual([]);
  });

  it('summarizes only configured IMAP, SMTP and CalDAV connections', () => {
    expect(
      getAccountPermissions({
        provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
        scopes: null,
        connectionParameters: {
          SMTP: {
            host: 'smtp.example.com',
            port: 465,
            username: 'alex',
            password: 'test',
          },
        },
      }),
    ).toEqual(['Write emails']);
  });
});

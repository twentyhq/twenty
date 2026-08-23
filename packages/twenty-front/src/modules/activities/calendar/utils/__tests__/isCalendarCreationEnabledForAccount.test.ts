import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { isCalendarCreationEnabledForAccount } from '@/activities/calendar/utils/isCalendarCreationEnabledForAccount';
import { ConnectedAccountProvider } from 'twenty-shared/types';

const makeAccount = (
  overrides: Partial<ConnectedAccount> = {},
): ConnectedAccount =>
  ({
    archivedAt: null,
    provider: ConnectedAccountProvider.GOOGLE,
    calendarChannels: [{ isSyncEnabled: true }],
    connectionParameters: null,
    ...overrides,
  }) as ConnectedAccount;

describe('isCalendarCreationEnabledForAccount', () => {
  it('accepts an active supported account with calendar sync enabled', () => {
    expect(isCalendarCreationEnabledForAccount(makeAccount())).toBe(true);
  });

  it('rejects archived accounts and accounts without calendar sync', () => {
    expect(
      isCalendarCreationEnabledForAccount(
        makeAccount({ archivedAt: '2026-08-23T00:00:00Z' }),
      ),
    ).toBe(false);
    expect(
      isCalendarCreationEnabledForAccount(
        makeAccount({ calendarChannels: [{ isSyncEnabled: false }] as never }),
      ),
    ).toBe(false);
  });

  it('requires CalDAV connection parameters for a CalDAV account', () => {
    const calDavAccount = makeAccount({
      provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
    });

    expect(isCalendarCreationEnabledForAccount(calDavAccount)).toBe(false);
    expect(
      isCalendarCreationEnabledForAccount(
        makeAccount({
          provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
          connectionParameters: {
            CALDAV: {
              host: 'https://calendar.example.com',
              port: 443,
              username: 'calendar@example.com',
              password: 'secret',
            },
          },
        }),
      ),
    ).toBe(true);
  });
});

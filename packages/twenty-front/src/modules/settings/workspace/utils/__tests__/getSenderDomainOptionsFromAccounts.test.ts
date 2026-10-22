import { getSenderDomainOptionsFromAccounts } from '@/settings/workspace/utils/getSenderDomainOptionsFromAccounts';
import { ConnectedAccountProvider } from 'twenty-shared/types';

type Account = Parameters<typeof getSenderDomainOptionsFromAccounts>[0][number];

const buildAccount = (overrides: Partial<Account>): Account =>
  ({
    handle: 'me@example.com',
    handleAliases: null,
    provider: ConnectedAccountProvider.GOOGLE,
    connectionParameters: null,
    archivedAt: null,
    ...overrides,
  }) as Account;

describe('getSenderDomainOptionsFromAccounts', () => {
  it('returns distinct lowercase domains of handles and aliases, sorted', () => {
    expect(
      getSenderDomainOptionsFromAccounts([
        buildAccount({
          handle: 'me@Zeta.com',
          handleAliases: ['sales@alpha.io', 'ME@ZETA.COM'],
        }),
        buildAccount({ handle: 'other@beta.org' }),
      ]),
    ).toEqual(['alpha.io', 'beta.org', 'zeta.com']);
  });

  it('excludes archived accounts', () => {
    expect(
      getSenderDomainOptionsFromAccounts([
        buildAccount({ handle: 'me@old.com', archivedAt: '2026-01-01' }),
        buildAccount({ handle: 'me@new.com' }),
      ]),
    ).toEqual(['new.com']);
  });

  it('excludes accounts that cannot send', () => {
    expect(
      getSenderDomainOptionsFromAccounts([
        buildAccount({
          handle: 'me@imap.com',
          provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
          connectionParameters: { IMAP: {} } as never,
        }),
        buildAccount({ handle: 'me@ok.com' }),
      ]),
    ).toEqual(['ok.com']);
  });

  it('returns an empty list without accounts', () => {
    expect(getSenderDomainOptionsFromAccounts([])).toEqual([]);
  });
});

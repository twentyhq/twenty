import { groupConnectedAccountsByBuiltInAccount } from '@/settings/app-preferences/utils/groupConnectedAccountsByBuiltInAccount';
import { ConnectedAccountProvider } from 'twenty-shared/types';

describe('groupConnectedAccountsByBuiltInAccount', () => {
  it('attaches app connections to the built-in account with the same email, ignoring case and spaces', () => {
    const google = {
      id: 'google',
      handle: 'tim@apple.dev',
      provider: ConnectedAccountProvider.GOOGLE,
    };
    const fathom = {
      id: 'fathom',
      handle: ' Tim@Apple.dev ',
      provider: ConnectedAccountProvider.APP,
    };

    expect(groupConnectedAccountsByBuiltInAccount([fathom, google])).toEqual([
      {
        id: 'google',
        handle: 'tim@apple.dev',
        builtInAccount: google,
        appAccounts: [fathom],
      },
    ]);
  });

  it('keeps built-in accounts with the same email on separate rows', () => {
    const google = {
      id: 'google',
      handle: 'tim@apple.dev',
      provider: ConnectedAccountProvider.GOOGLE,
    };
    const imap = {
      id: 'imap',
      handle: 'tim@apple.dev',
      provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
    };
    const fathom = {
      id: 'fathom',
      handle: 'tim@apple.dev',
      provider: ConnectedAccountProvider.APP,
    };

    expect(
      groupConnectedAccountsByBuiltInAccount([google, imap, fathom]),
    ).toEqual([
      {
        id: 'google',
        handle: 'tim@apple.dev',
        builtInAccount: google,
        appAccounts: [fathom],
      },
      {
        id: 'imap',
        handle: 'tim@apple.dev',
        builtInAccount: imap,
        appAccounts: [],
      },
    ]);
  });

  it('groups app connections without a built-in account by email', () => {
    const fathom = {
      id: 'fathom',
      handle: 'notes@apple.dev',
      provider: ConnectedAccountProvider.APP,
    };
    const granola = {
      id: 'granola',
      handle: 'Notes@apple.dev',
      provider: ConnectedAccountProvider.APP,
    };
    const otherFathom = {
      id: 'other-fathom',
      handle: 'sales@apple.dev',
      provider: ConnectedAccountProvider.APP,
    };

    expect(
      groupConnectedAccountsByBuiltInAccount([fathom, granola, otherFathom]),
    ).toEqual([
      {
        id: 'fathom',
        handle: 'notes@apple.dev',
        appAccounts: [fathom, granola],
      },
      {
        id: 'other-fathom',
        handle: 'sales@apple.dev',
        appAccounts: [otherFathom],
      },
    ]);
  });
});

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { filterConnectedAccountsAbleToSendEmail } from '@/accounts/utils/filterConnectedAccountsAbleToSendEmail';

describe('filterConnectedAccountsAbleToSendEmail', () => {
  it('keeps only the accounts whose provider can send, in their original order', () => {
    const googleAccount = {
      id: 'google',
      provider: ConnectedAccountProvider.GOOGLE,
    };
    const imapWithoutSmtpAccount = {
      id: 'imap-without-smtp',
      provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
      connectionParameters: { IMAP: { host: 'imap.example.com' } },
    };
    const imapWithSmtpAccount = {
      id: 'imap-with-smtp',
      provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
      connectionParameters: { SMTP: { host: 'smtp.example.com' } },
    };
    const sharedMailboxAccount = {
      id: 'shared-mailbox',
      provider: ConnectedAccountProvider.EMAIL_GROUP,
    };
    const oidcAccount = {
      id: 'oidc',
      provider: ConnectedAccountProvider.OIDC,
    };

    expect(
      filterConnectedAccountsAbleToSendEmail([
        oidcAccount,
        googleAccount,
        imapWithoutSmtpAccount,
        sharedMailboxAccount,
        imapWithSmtpAccount,
      ]),
    ).toEqual([googleAccount, sharedMailboxAccount, imapWithSmtpAccount]);
  });

  it('returns an empty list when no account can send', () => {
    expect(
      filterConnectedAccountsAbleToSendEmail([
        { id: 'oidc', provider: ConnectedAccountProvider.OIDC },
      ]),
    ).toEqual([]);
  });
});

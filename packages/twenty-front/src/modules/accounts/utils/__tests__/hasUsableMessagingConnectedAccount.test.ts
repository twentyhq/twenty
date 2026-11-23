import { ConnectedAccountProvider } from 'twenty-shared/types';

import { hasUsableMessagingConnectedAccount } from '@/accounts/utils/hasUsableMessagingConnectedAccount';

const whatsappAccount = {
  id: 'whatsapp',
  provider: ConnectedAccountProvider.APP,
  authFailedAt: null,
  archivedAt: null,
};

const smtpOnlyAccount = {
  id: 'smtp',
  provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
  connectionParameters: { SMTP: { host: 'smtp.acme.com', port: 587 } },
  authFailedAt: null,
  archivedAt: null,
};

describe('hasUsableMessagingConnectedAccount', () => {
  it('accepts any account that has a message channel, email or not', () => {
    expect(
      hasUsableMessagingConnectedAccount({
        connectedAccounts: [whatsappAccount],
        messageChannels: [{ connectedAccountId: 'whatsapp' }],
      }),
    ).toBe(true);
  });

  it('ignores accounts without a message channel', () => {
    expect(
      hasUsableMessagingConnectedAccount({
        connectedAccounts: [whatsappAccount],
        messageChannels: [],
      }),
    ).toBe(false);
  });

  it('ignores disconnected and removed accounts', () => {
    expect(
      hasUsableMessagingConnectedAccount({
        connectedAccounts: [
          { ...whatsappAccount, authFailedAt: '2026-11-01T00:00:00.000Z' },
          {
            id: 'gmail',
            provider: ConnectedAccountProvider.GOOGLE,
            authFailedAt: null,
            archivedAt: '2026-11-01T00:00:00.000Z',
          },
        ],
        messageChannels: [
          { connectedAccountId: 'whatsapp' },
          { connectedAccountId: 'gmail' },
        ],
      }),
    ).toBe(false);
  });

  it('accepts an account that can send email without a message channel', () => {
    expect(
      hasUsableMessagingConnectedAccount({
        connectedAccounts: [smtpOnlyAccount],
        messageChannels: [],
      }),
    ).toBe(true);
  });

  it('ignores a disconnected account that could send email', () => {
    expect(
      hasUsableMessagingConnectedAccount({
        connectedAccounts: [
          { ...smtpOnlyAccount, authFailedAt: '2026-11-01T00:00:00.000Z' },
        ],
        messageChannels: [],
      }),
    ).toBe(false);
  });
});

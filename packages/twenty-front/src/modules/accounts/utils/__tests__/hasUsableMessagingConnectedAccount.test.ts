import { hasUsableMessagingConnectedAccount } from '@/accounts/utils/hasUsableMessagingConnectedAccount';

const whatsappAccount = {
  id: 'whatsapp',
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
});

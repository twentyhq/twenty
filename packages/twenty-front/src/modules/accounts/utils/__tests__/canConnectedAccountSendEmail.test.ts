import { canConnectedAccountSendEmail } from '@/accounts/utils/canConnectedAccountSendEmail';
import { ConnectedAccountProvider } from 'twenty-shared/types';

describe('canConnectedAccountSendEmail', () => {
  it('accepts a google account', () => {
    expect(
      canConnectedAccountSendEmail({
        provider: ConnectedAccountProvider.GOOGLE,
        connectionParameters: null,
      }),
    ).toBe(true);
  });

  it('accepts an email group account', () => {
    expect(
      canConnectedAccountSendEmail({
        provider: ConnectedAccountProvider.EMAIL_GROUP,
        connectionParameters: null,
      }),
    ).toBe(true);
  });

  it('rejects an app connection the outbound driver cannot send from', () => {
    expect(
      canConnectedAccountSendEmail({
        provider: ConnectedAccountProvider.APP,
        connectionParameters: null,
      }),
    ).toBe(false);
  });

  it('rejects an sso account', () => {
    expect(
      canConnectedAccountSendEmail({
        provider: ConnectedAccountProvider.OIDC,
        connectionParameters: null,
      }),
    ).toBe(false);
  });

  it('rejects an imap account without smtp configured', () => {
    expect(
      canConnectedAccountSendEmail({
        provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
        connectionParameters: { IMAP: { host: 'imap.example.com', port: 993 } },
      }),
    ).toBe(false);
  });

  it('accepts an imap account with smtp configured', () => {
    expect(
      canConnectedAccountSendEmail({
        provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
        connectionParameters: { SMTP: { host: 'smtp.example.com', port: 587 } },
      }),
    ).toBe(true);
  });
});

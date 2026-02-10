import { GMAIL_COMPOSE_SCOPE } from '@/accounts/constants/GmailComposeScope';
import { MICROSOFT_SEND_SCOPE } from '@/accounts/constants/MicrosoftSendScope';
import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { hasMissingDraftEmailScopes } from '@/accounts/utils/hasMissingDraftEmailScopes';
import { ConnectedAccountProvider } from 'twenty-shared/types';

const buildConnectedAccount = (
  overrides: Partial<ConnectedAccount>,
): ConnectedAccount =>
  ({
    id: 'test-id',
    handle: 'test@example.com',
    provider: ConnectedAccountProvider.GOOGLE,
    scopes: [],
    ...overrides,
  }) as ConnectedAccount;

describe('hasMissingDraftEmailScopes', () => {
  describe('Google provider', () => {
    it('should return true when gmail.compose is missing', () => {
      const account = buildConnectedAccount({
        provider: ConnectedAccountProvider.GOOGLE,
        scopes: [],
      });

      expect(hasMissingDraftEmailScopes(account)).toBe(true);
    });

    it('should return false when gmail.compose scope exists', () => {
      const account = buildConnectedAccount({
        provider: ConnectedAccountProvider.GOOGLE,
        scopes: [GMAIL_COMPOSE_SCOPE],
      });

      expect(hasMissingDraftEmailScopes(account)).toBe(false);
    });

    it('should return true when scopes are null', () => {
      const account = buildConnectedAccount({
        provider: ConnectedAccountProvider.GOOGLE,
        scopes: null,
      });

      expect(hasMissingDraftEmailScopes(account)).toBe(true);
    });
  });

  describe('Microsoft provider', () => {
    it('should return true when Mail.Send is missing', () => {
      const account = buildConnectedAccount({
        provider: ConnectedAccountProvider.MICROSOFT,
        scopes: [],
      });

      expect(hasMissingDraftEmailScopes(account)).toBe(true);
    });

    it('should return false when Mail.Send scope exists', () => {
      const account = buildConnectedAccount({
        provider: ConnectedAccountProvider.MICROSOFT,
        scopes: [MICROSOFT_SEND_SCOPE],
      });

      expect(hasMissingDraftEmailScopes(account)).toBe(false);
    });
  });

  describe('IMAP/SMTP provider', () => {
    it('should always return false', () => {
      const account = buildConnectedAccount({
        provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
        connectionParameters: undefined,
      });

      expect(hasMissingDraftEmailScopes(account)).toBe(false);
    });
  });
});

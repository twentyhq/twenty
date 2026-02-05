import { GMAIL_COMPOSE_SCOPE } from '@/accounts/constants/GmailComposeScope';
import { GMAIL_SEND_SCOPE } from '@/accounts/constants/GmailSendScope';
import { MICROSOFT_SEND_SCOPE } from '@/accounts/constants/MicrosoftSendScope';
import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { getRequiredEmailScopes } from '@/accounts/utils/getRequiredEmailScopes';
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

describe('getRequiredEmailScopes', () => {
  describe('Google provider', () => {
    it('should require gmail.send for SEND_EMAIL', () => {
      const account = buildConnectedAccount({
        provider: ConnectedAccountProvider.GOOGLE,
        scopes: [],
      });

      const result = getRequiredEmailScopes(account, 'SEND_EMAIL');

      expect(result.hasRequiredScopes).toBe(false);
      expect(result.extraScopes).toEqual([GMAIL_SEND_SCOPE]);
    });

    it('should require gmail.compose for DRAFT_EMAIL', () => {
      const account = buildConnectedAccount({
        provider: ConnectedAccountProvider.GOOGLE,
        scopes: [],
      });

      const result = getRequiredEmailScopes(account, 'DRAFT_EMAIL');

      expect(result.hasRequiredScopes).toBe(false);
      expect(result.extraScopes).toEqual([GMAIL_COMPOSE_SCOPE]);
    });

    it('should detect existing gmail.send scope', () => {
      const account = buildConnectedAccount({
        provider: ConnectedAccountProvider.GOOGLE,
        scopes: [GMAIL_SEND_SCOPE],
      });

      const result = getRequiredEmailScopes(account, 'SEND_EMAIL');

      expect(result.hasRequiredScopes).toBe(true);
      expect(result.extraScopes).toEqual([]);
    });

    it('should detect existing gmail.compose scope', () => {
      const account = buildConnectedAccount({
        provider: ConnectedAccountProvider.GOOGLE,
        scopes: [GMAIL_SEND_SCOPE, GMAIL_COMPOSE_SCOPE],
      });

      const result = getRequiredEmailScopes(account, 'DRAFT_EMAIL');

      expect(result.hasRequiredScopes).toBe(true);
      expect(result.extraScopes).toEqual([]);
    });

    it('should not treat gmail.send as sufficient for DRAFT_EMAIL', () => {
      const account = buildConnectedAccount({
        provider: ConnectedAccountProvider.GOOGLE,
        scopes: [GMAIL_SEND_SCOPE],
      });

      const result = getRequiredEmailScopes(account, 'DRAFT_EMAIL');

      expect(result.hasRequiredScopes).toBe(false);
      expect(result.extraScopes).toEqual([GMAIL_COMPOSE_SCOPE]);
    });

    it('should handle null scopes', () => {
      const account = buildConnectedAccount({
        provider: ConnectedAccountProvider.GOOGLE,
        scopes: null,
      });

      const result = getRequiredEmailScopes(account, 'SEND_EMAIL');

      expect(result.hasRequiredScopes).toBe(false);
      expect(result.extraScopes).toEqual([GMAIL_SEND_SCOPE]);
    });
  });

  describe('Microsoft provider', () => {
    it('should require Mail.Send for SEND_EMAIL', () => {
      const account = buildConnectedAccount({
        provider: ConnectedAccountProvider.MICROSOFT,
        scopes: [],
      });

      const result = getRequiredEmailScopes(account, 'SEND_EMAIL');

      expect(result.hasRequiredScopes).toBe(false);
      expect(result.extraScopes).toEqual([MICROSOFT_SEND_SCOPE]);
    });

    it('should require Mail.Send for DRAFT_EMAIL', () => {
      const account = buildConnectedAccount({
        provider: ConnectedAccountProvider.MICROSOFT,
        scopes: [],
      });

      const result = getRequiredEmailScopes(account, 'DRAFT_EMAIL');

      expect(result.hasRequiredScopes).toBe(false);
      expect(result.extraScopes).toEqual([MICROSOFT_SEND_SCOPE]);
    });

    it('should detect existing Mail.Send scope', () => {
      const account = buildConnectedAccount({
        provider: ConnectedAccountProvider.MICROSOFT,
        scopes: [MICROSOFT_SEND_SCOPE],
      });

      const result = getRequiredEmailScopes(account, 'DRAFT_EMAIL');

      expect(result.hasRequiredScopes).toBe(true);
      expect(result.extraScopes).toEqual([]);
    });
  });

  describe('IMAP/SMTP provider', () => {
    it('should return true when SMTP is configured', () => {
      const account = buildConnectedAccount({
        provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
        connectionParameters: {
          SMTP: { host: 'smtp.example.com', port: 587 },
        } as ConnectedAccount['connectionParameters'],
      });

      const result = getRequiredEmailScopes(account, 'SEND_EMAIL');

      expect(result.hasRequiredScopes).toBe(true);
      expect(result.extraScopes).toEqual([]);
    });

    it('should return false when SMTP is not configured', () => {
      const account = buildConnectedAccount({
        provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
        connectionParameters: undefined,
      });

      const result = getRequiredEmailScopes(account, 'SEND_EMAIL');

      expect(result.hasRequiredScopes).toBe(false);
      expect(result.extraScopes).toEqual([]);
    });

    it('should never return extraScopes', () => {
      const account = buildConnectedAccount({
        provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
        connectionParameters: undefined,
      });

      const result = getRequiredEmailScopes(account, 'DRAFT_EMAIL');

      expect(result.extraScopes).toEqual([]);
    });
  });
});

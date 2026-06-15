import { ConnectedAccountProvider } from 'twenty-shared/types';

import { getMissingDraftEmailScopes } from 'src/engine/core-modules/tool/tools/email-tool/utils/get-missing-draft-email-scopes.util';

const GMAIL_COMPOSE_SCOPE = 'https://www.googleapis.com/auth/gmail.compose';
const MICROSOFT_SEND_SCOPE = 'Mail.Send';

describe('getMissingDraftEmailScopes', () => {
  describe('Google provider', () => {
    it('returns the compose scope when missing', () => {
      expect(
        getMissingDraftEmailScopes({
          provider: ConnectedAccountProvider.GOOGLE,
          scopes: ['email', 'profile'],
        }),
      ).toEqual([GMAIL_COMPOSE_SCOPE]);
    });

    it('returns the compose scope when scopes are null', () => {
      expect(
        getMissingDraftEmailScopes({
          provider: ConnectedAccountProvider.GOOGLE,
          scopes: null,
        }),
      ).toEqual([GMAIL_COMPOSE_SCOPE]);
    });

    it('returns nothing when the compose scope is present', () => {
      expect(
        getMissingDraftEmailScopes({
          provider: ConnectedAccountProvider.GOOGLE,
          scopes: ['email', GMAIL_COMPOSE_SCOPE],
        }),
      ).toEqual([]);
    });
  });

  describe('Microsoft provider', () => {
    it('returns the send scope when missing', () => {
      expect(
        getMissingDraftEmailScopes({
          provider: ConnectedAccountProvider.MICROSOFT,
          scopes: ['Mail.ReadWrite'],
        }),
      ).toEqual([MICROSOFT_SEND_SCOPE]);
    });

    it('returns nothing when the send scope is present', () => {
      expect(
        getMissingDraftEmailScopes({
          provider: ConnectedAccountProvider.MICROSOFT,
          scopes: [MICROSOFT_SEND_SCOPE],
        }),
      ).toEqual([]);
    });
  });

  describe('non-OAuth providers', () => {
    it.each([
      ConnectedAccountProvider.IMAP_SMTP_CALDAV,
      ConnectedAccountProvider.EMAIL_GROUP,
      ConnectedAccountProvider.APP,
      ConnectedAccountProvider.OIDC,
      ConnectedAccountProvider.SAML,
    ])('never requires scopes for %s accounts', (provider) => {
      expect(getMissingDraftEmailScopes({ provider, scopes: null })).toEqual([]);
    });
  });
});

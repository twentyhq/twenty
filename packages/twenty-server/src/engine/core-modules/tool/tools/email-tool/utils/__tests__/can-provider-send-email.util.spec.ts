import { ConnectedAccountProvider } from 'twenty-shared/types';

import { canProviderSendEmail } from 'src/engine/core-modules/tool/tools/email-tool/utils/can-provider-send-email.util';

describe('canProviderSendEmail', () => {
  it.each([
    ConnectedAccountProvider.GOOGLE,
    ConnectedAccountProvider.MICROSOFT,
    ConnectedAccountProvider.IMAP_SMTP_CALDAV,
    ConnectedAccountProvider.EMAIL_GROUP,
  ])('accepts %s', (provider) => {
    expect(canProviderSendEmail(provider)).toBe(true);
  });

  it.each([
    ConnectedAccountProvider.APP,
    ConnectedAccountProvider.OIDC,
    ConnectedAccountProvider.SAML,
  ])('rejects %s, it carries no mailbox', (provider) => {
    expect(canProviderSendEmail(provider)).toBe(false);
  });
});

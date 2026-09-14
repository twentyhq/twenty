import { ConnectedAccountProvider } from 'twenty-shared/types';

import { canProviderComposeEmail } from 'src/engine/core-modules/tool/tools/email-tool/utils/can-provider-compose-email.util';

describe('canProviderComposeEmail', () => {
  it.each([
    ConnectedAccountProvider.GOOGLE,
    ConnectedAccountProvider.MICROSOFT,
    ConnectedAccountProvider.IMAP_SMTP_CALDAV,
  ])('accepts %s for both operations', (provider) => {
    expect(canProviderComposeEmail({ provider, operation: 'send' })).toBe(true);
    expect(canProviderComposeEmail({ provider, operation: 'draft' })).toBe(
      true,
    );
  });

  it('accepts an email group for sending but not for drafting, it holds no mailbox', () => {
    const provider = ConnectedAccountProvider.EMAIL_GROUP;

    expect(canProviderComposeEmail({ provider, operation: 'send' })).toBe(true);
    expect(canProviderComposeEmail({ provider, operation: 'draft' })).toBe(
      false,
    );
  });

  it.each([
    ConnectedAccountProvider.APP,
    ConnectedAccountProvider.OIDC,
    ConnectedAccountProvider.SAML,
  ])('rejects %s for both operations, it carries no mailbox', (provider) => {
    expect(canProviderComposeEmail({ provider, operation: 'send' })).toBe(
      false,
    );
    expect(canProviderComposeEmail({ provider, operation: 'draft' })).toBe(
      false,
    );
  });
});

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { canProviderPerformEmailOperation } from 'src/engine/core-modules/tool/tools/email-tool/utils/can-provider-perform-email-operation.util';

describe('canProviderPerformEmailOperation', () => {
  it('allows Google to send and to draft', () => {
    expect(
      canProviderPerformEmailOperation({
        provider: ConnectedAccountProvider.GOOGLE,
        operation: 'SEND',
      }),
    ).toBe(true);
    expect(
      canProviderPerformEmailOperation({
        provider: ConnectedAccountProvider.GOOGLE,
        operation: 'DRAFT',
      }),
    ).toBe(true);
  });

  it('allows Microsoft to send and to draft', () => {
    expect(
      canProviderPerformEmailOperation({
        provider: ConnectedAccountProvider.MICROSOFT,
        operation: 'SEND',
      }),
    ).toBe(true);
    expect(
      canProviderPerformEmailOperation({
        provider: ConnectedAccountProvider.MICROSOFT,
        operation: 'DRAFT',
      }),
    ).toBe(true);
  });

  it('allows IMAP_SMTP_CALDAV at provider level, leaving configuration to the account check', () => {
    expect(
      canProviderPerformEmailOperation({
        provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
        operation: 'SEND',
      }),
    ).toBe(true);
    expect(
      canProviderPerformEmailOperation({
        provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
        operation: 'DRAFT',
      }),
    ).toBe(true);
  });

  it('lets an email group send but never draft', () => {
    expect(
      canProviderPerformEmailOperation({
        provider: ConnectedAccountProvider.EMAIL_GROUP,
        operation: 'SEND',
      }),
    ).toBe(true);
    expect(
      canProviderPerformEmailOperation({
        provider: ConnectedAccountProvider.EMAIL_GROUP,
        operation: 'DRAFT',
      }),
    ).toBe(false);
  });

  it('rejects OIDC, SAML and APP for both operations', () => {
    for (const provider of [
      ConnectedAccountProvider.OIDC,
      ConnectedAccountProvider.SAML,
      ConnectedAccountProvider.APP,
    ]) {
      expect(
        canProviderPerformEmailOperation({ provider, operation: 'SEND' }),
      ).toBe(false);
      expect(
        canProviderPerformEmailOperation({ provider, operation: 'DRAFT' }),
      ).toBe(false);
    }
  });
});

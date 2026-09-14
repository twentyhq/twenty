import { ConnectedAccountProvider } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';

import { type EmailComposeOperation } from 'src/engine/core-modules/tool/tools/email-tool/types/email-compose-operation.type';

// Mirrors MessagingMessageOutboundService: an email group can send but holds no mailbox to draft into,
// and app, oidc and saml accounts carry no mailbox at all.
export const canProviderComposeEmail = ({
  provider,
  operation,
}: {
  provider: ConnectedAccountProvider;
  operation: EmailComposeOperation;
}): boolean => {
  switch (provider) {
    case ConnectedAccountProvider.GOOGLE:
    case ConnectedAccountProvider.MICROSOFT:
    case ConnectedAccountProvider.IMAP_SMTP_CALDAV:
      return true;
    case ConnectedAccountProvider.EMAIL_GROUP:
      return operation === 'send';
    case ConnectedAccountProvider.APP:
    case ConnectedAccountProvider.OIDC:
    case ConnectedAccountProvider.SAML:
      return false;
    default:
      return assertUnreachable(
        provider,
        `Unhandled connected account provider for email composition: ${provider}`,
      );
  }
};

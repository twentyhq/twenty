import { ConnectedAccountProvider } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';

import { type EmailOperation } from 'src/engine/core-modules/tool/tools/email-tool/types/email-operation.type';

export const canProviderPerformEmailOperation = ({
  provider,
  operation,
}: {
  provider: ConnectedAccountProvider;
  operation: EmailOperation;
}): boolean => {
  switch (provider) {
    case ConnectedAccountProvider.GOOGLE:
    case ConnectedAccountProvider.MICROSOFT:
    case ConnectedAccountProvider.IMAP_SMTP_CALDAV:
      return true;
    case ConnectedAccountProvider.EMAIL_GROUP:
      // Email group channels have no drafts folder to write into.
      return operation === 'SEND';
    case ConnectedAccountProvider.OIDC:
    case ConnectedAccountProvider.SAML:
    case ConnectedAccountProvider.APP:
      return false;
    default:
      return assertUnreachable(
        provider,
        `Unhandled connected account provider for email operation: ${provider}`,
      );
  }
};

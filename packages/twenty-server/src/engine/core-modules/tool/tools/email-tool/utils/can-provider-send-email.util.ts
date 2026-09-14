import { ConnectedAccountProvider } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';

export const canProviderSendEmail = (
  provider: ConnectedAccountProvider,
): boolean => {
  switch (provider) {
    case ConnectedAccountProvider.GOOGLE:
    case ConnectedAccountProvider.MICROSOFT:
    case ConnectedAccountProvider.IMAP_SMTP_CALDAV:
    case ConnectedAccountProvider.EMAIL_GROUP:
      return true;
    case ConnectedAccountProvider.APP:
    case ConnectedAccountProvider.OIDC:
    case ConnectedAccountProvider.SAML:
      return false;
    default:
      return assertUnreachable(
        provider,
        `Unhandled connected account provider for email sending: ${provider}`,
      );
  }
};

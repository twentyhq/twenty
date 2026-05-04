import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { ApplicationOAuthProviderExceptionCode } from 'src/engine/core-modules/application/application-oauth-provider/application-oauth-provider-exception-code.enum';
import { CustomException } from 'src/utils/custom-exception';

const getApplicationOAuthProviderExceptionUserFriendlyMessage = (
  code: ApplicationOAuthProviderExceptionCode,
) => {
  switch (code) {
    case ApplicationOAuthProviderExceptionCode.PROVIDER_NOT_FOUND:
      return msg`OAuth provider not found.`;
    case ApplicationOAuthProviderExceptionCode.CLIENT_CREDENTIALS_NOT_CONFIGURED:
      return msg`Client credentials are not configured for this OAuth provider.`;
    case ApplicationOAuthProviderExceptionCode.TOKEN_EXCHANGE_FAILED:
      return msg`Failed to exchange the authorization code for an access token.`;
    case ApplicationOAuthProviderExceptionCode.REFRESH_FAILED:
      return msg`Failed to refresh the access token.`;
    case ApplicationOAuthProviderExceptionCode.INVALID_STATE:
      return msg`The OAuth state parameter is invalid or expired.`;
    case ApplicationOAuthProviderExceptionCode.INVALID_REQUEST:
      return msg`The OAuth request is missing required parameters.`;
    case ApplicationOAuthProviderExceptionCode.FORBIDDEN:
      return msg`Not authorized to access this OAuth provider.`;
    default:
      assertUnreachable(code);
  }
};

export class ApplicationOAuthProviderException extends CustomException<ApplicationOAuthProviderExceptionCode> {
  constructor(
    message: string,
    code: ApplicationOAuthProviderExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getApplicationOAuthProviderExceptionUserFriendlyMessage(code),
    });
  }
}

import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { CustomException } from 'src/utils/custom-exception';

const getConnectionProviderExceptionUserFriendlyMessage = (
  code: ConnectionProviderExceptionCode,
) => {
  switch (code) {
    case ConnectionProviderExceptionCode.PROVIDER_NOT_FOUND:
      return msg`OAuth provider not found.`;
    case ConnectionProviderExceptionCode.CLIENT_CREDENTIALS_NOT_CONFIGURED:
      return msg`Client credentials are not configured for this OAuth provider.`;
    case ConnectionProviderExceptionCode.TOKEN_EXCHANGE_FAILED:
      return msg`Failed to exchange the authorization code for an access token.`;
    case ConnectionProviderExceptionCode.REFRESH_FAILED:
      return msg`Failed to refresh the access token.`;
    case ConnectionProviderExceptionCode.INVALID_STATE:
      return msg`The OAuth state parameter is invalid or expired.`;
    case ConnectionProviderExceptionCode.INVALID_REQUEST:
      return msg`The OAuth request is missing required parameters.`;
    case ConnectionProviderExceptionCode.FORBIDDEN:
      return msg`Not authorized to access this OAuth provider.`;
    case ConnectionProviderExceptionCode.INVALID_CONNECTION_PROVIDER_INPUT:
      return msg`The connection-provider manifest is missing required fields.`;
    case ConnectionProviderExceptionCode.CONNECTION_PROVIDER_NOT_FOUND:
      return msg`Connection provider not found.`;
    case ConnectionProviderExceptionCode.CONNECTION_PROVIDER_NAME_ALREADY_EXISTS:
      return msg`A connection provider with this name already exists for this application.`;
    default:
      assertUnreachable(code);
  }
};

export class ConnectionProviderException extends CustomException<ConnectionProviderExceptionCode> {
  constructor(
    message: string,
    code: ConnectionProviderExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getConnectionProviderExceptionUserFriendlyMessage(code),
    });
  }
}

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
    case ConnectionProviderExceptionCode.ACCOUNT_IDENTIFICATION_FAILED:
      return msg`We could not identify the account. Please try connecting again.`;
    case ConnectionProviderExceptionCode.RECONNECT_ACCOUNT_MISMATCH:
      return msg`You signed in to a different account. Reconnect using the original account, or add a new connection.`;
    case ConnectionProviderExceptionCode.RECONNECT_ACCOUNT_IDENTITY_UNKNOWN:
      return msg`We could not verify the original account for this connection. Add a new connection to avoid changing the account used by existing workflows.`;
    case ConnectionProviderExceptionCode.ACCOUNT_ALREADY_CONNECTED:
      return msg`This account already has an active connection with the requested sharing. Use the existing connection.`;
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
    case ConnectionProviderExceptionCode.CONNECTION_NOT_FOUND:
      return msg`Connection not found.`;
    case ConnectionProviderExceptionCode.CONNECTION_PROVIDER_NAME_ALREADY_EXISTS:
      return msg`A connection provider with this name already exists for this application.`;
    case ConnectionProviderExceptionCode.ON_CONNECT_LOGIC_FUNCTION_NOT_FOUND:
      return msg`The logic function to run on connect was not found.`;
    case ConnectionProviderExceptionCode.ON_DISCONNECT_LOGIC_FUNCTION_NOT_FOUND:
      return msg`The logic function to run on disconnect was not found.`;
    case ConnectionProviderExceptionCode.ON_DISCONNECT_LOGIC_FUNCTION_FAILED:
      return msg`The logic function to run on disconnect failed.`;
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

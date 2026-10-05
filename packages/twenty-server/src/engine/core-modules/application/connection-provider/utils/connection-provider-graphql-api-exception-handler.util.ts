import { assertUnreachable } from 'twenty-shared/utils';

import {
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';

export const connectionProviderGraphqlApiExceptionHandler = (error: Error) => {
  if (error instanceof ConnectionProviderException) {
    switch (error.code) {
      case ConnectionProviderExceptionCode.CONNECTION_NOT_FOUND:
      case ConnectionProviderExceptionCode.CONNECTION_PROVIDER_NOT_FOUND:
      case ConnectionProviderExceptionCode.PROVIDER_NOT_FOUND:
      case ConnectionProviderExceptionCode.ON_CONNECT_LOGIC_FUNCTION_NOT_FOUND:
      case ConnectionProviderExceptionCode.ON_DISCONNECT_LOGIC_FUNCTION_NOT_FOUND:
        throw new NotFoundError(error);
      case ConnectionProviderExceptionCode.FORBIDDEN:
        throw new ForbiddenError(error);
      case ConnectionProviderExceptionCode.INVALID_REQUEST:
      case ConnectionProviderExceptionCode.INVALID_STATE:
      case ConnectionProviderExceptionCode.INVALID_CONNECTION_PROVIDER_INPUT:
      case ConnectionProviderExceptionCode.CONNECTION_PROVIDER_NAME_ALREADY_EXISTS:
        throw new UserInputError(error);
      case ConnectionProviderExceptionCode.CLIENT_CREDENTIALS_NOT_CONFIGURED:
      case ConnectionProviderExceptionCode.TOKEN_EXCHANGE_FAILED:
      case ConnectionProviderExceptionCode.REFRESH_FAILED:
      case ConnectionProviderExceptionCode.ON_DISCONNECT_LOGIC_FUNCTION_FAILED:
        throw new InternalServerError(error);
      default: {
        return assertUnreachable(error.code);
      }
    }
  }

  throw error;
};

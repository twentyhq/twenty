import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  Injectable,
} from '@nestjs/common';

import { type Response } from 'express';
import { assertUnreachable } from 'twenty-shared/utils';

import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';
import { type CustomException } from 'src/utils/custom-exception';

const connectionProviderExceptionCodeToHttpStatus = (
  code: ConnectionProviderExceptionCode,
): number => {
  switch (code) {
    case ConnectionProviderExceptionCode.CONNECTION_NOT_FOUND:
    case ConnectionProviderExceptionCode.CONNECTION_PROVIDER_NOT_FOUND:
    case ConnectionProviderExceptionCode.PROVIDER_NOT_FOUND:
    case ConnectionProviderExceptionCode.ON_CONNECT_LOGIC_FUNCTION_NOT_FOUND:
    case ConnectionProviderExceptionCode.ON_DISCONNECT_LOGIC_FUNCTION_NOT_FOUND:
      return 404;
    case ConnectionProviderExceptionCode.FORBIDDEN:
      return 403;
    case ConnectionProviderExceptionCode.INVALID_REQUEST:
    case ConnectionProviderExceptionCode.INVALID_STATE:
    case ConnectionProviderExceptionCode.INVALID_CONNECTION_PROVIDER_INPUT:
    case ConnectionProviderExceptionCode.CONNECTION_PROVIDER_NAME_ALREADY_EXISTS:
      return 400;
    case ConnectionProviderExceptionCode.CLIENT_CREDENTIALS_NOT_CONFIGURED:
    case ConnectionProviderExceptionCode.TOKEN_EXCHANGE_FAILED:
    case ConnectionProviderExceptionCode.REFRESH_FAILED:
    case ConnectionProviderExceptionCode.ON_DISCONNECT_LOGIC_FUNCTION_FAILED:
      return 500;
    default:
      return assertUnreachable(code);
  }
};

@Injectable()
@Catch(ConnectionProviderException)
export class ConnectionProviderRestApiExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpExceptionHandlerService: HttpExceptionHandlerService,
  ) {}

  catch(exception: ConnectionProviderException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    return this.httpExceptionHandlerService.handleError(
      exception as CustomException,
      response,
      connectionProviderExceptionCodeToHttpStatus(exception.code),
    );
  }
}

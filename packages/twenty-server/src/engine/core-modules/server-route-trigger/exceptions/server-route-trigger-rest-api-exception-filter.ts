import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
} from '@nestjs/common';

import type { Response } from 'express';

import { HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';
import {
  ServerRouteTriggerException,
  ServerRouteTriggerExceptionCode,
} from 'src/engine/core-modules/server-route-trigger/exceptions/server-route-trigger.exception';
import type { CustomException } from 'src/utils/custom-exception';

@Catch(ServerRouteTriggerException)
export class ServerRouteTriggerRestApiExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpExceptionHandlerService: HttpExceptionHandlerService,
  ) {}

  catch(exception: ServerRouteTriggerException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    switch (exception.code) {
      case ServerRouteTriggerExceptionCode.LOGIC_FUNCTION_NOT_FOUND:
        return this.httpExceptionHandlerService.handleError(
          exception as CustomException,
          response,
          404,
        );
      case ServerRouteTriggerExceptionCode.RATE_LIMIT_EXCEEDED:
        return this.httpExceptionHandlerService.handleError(
          exception as CustomException,
          response,
          429,
          undefined,
          undefined,
          { shouldBeCapturedBySentry: false },
        );
      case ServerRouteTriggerExceptionCode.SERVER_ROUTE_USER_UNCAUGHT_ERROR:
        return this.httpExceptionHandlerService.handleError(
          exception as CustomException,
          response,
          500,
          undefined,
          undefined,
          { shouldBeCapturedBySentry: false },
        );
      case ServerRouteTriggerExceptionCode.SERVER_ROUTE_PLATFORM_ERROR:
        return this.httpExceptionHandlerService.handleError(
          exception as CustomException,
          response,
          500,
        );
      case ServerRouteTriggerExceptionCode.RESOLVER_INVALID_RESULT:
        return this.httpExceptionHandlerService.handleError(
          exception as CustomException,
          response,
          502,
          undefined,
          undefined,
          { shouldBeCapturedBySentry: false },
        );
      default: {
        return this.httpExceptionHandlerService.handleError(
          exception as CustomException,
          response,
          400,
        );
      }
    }
  }
}

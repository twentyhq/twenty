import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
} from '@nestjs/common';

import type { Response } from 'express';

import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { getAuthExceptionRestStatus } from 'src/engine/core-modules/auth/utils/get-auth-exception-rest-status.util';
import {
  RouteTriggerException,
  RouteTriggerExceptionCode,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/exceptions/route-trigger.exception';
import type { CustomException } from 'src/utils/custom-exception';
import { HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';

@Catch(RouteTriggerException, AuthException)
export class RouteTriggerRestApiExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpExceptionHandlerService: HttpExceptionHandlerService,
  ) {}

  catch(exception: RouteTriggerException | AuthException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof AuthException) {
      return this.httpExceptionHandlerService.handleError(
        exception,
        response,
        getAuthExceptionRestStatus(exception),
      );
    }

    switch (exception.code) {
      case RouteTriggerExceptionCode.WORKSPACE_NOT_FOUND:
      case RouteTriggerExceptionCode.ROUTE_NOT_FOUND:
      case RouteTriggerExceptionCode.TRIGGER_NOT_FOUND:
      case RouteTriggerExceptionCode.LOGIC_FUNCTION_NOT_FOUND:
        return this.httpExceptionHandlerService.handleError(
          exception as CustomException,
          response,
          404,
        );
      case RouteTriggerExceptionCode.FORBIDDEN_EXCEPTION:
      case RouteTriggerExceptionCode.WORKSPACE_SUSPENDED:
        return this.httpExceptionHandlerService.handleError(
          exception as CustomException,
          response,
          403,
        );
      case RouteTriggerExceptionCode.RATE_LIMIT_EXCEEDED:
        return this.httpExceptionHandlerService.handleError(
          exception as CustomException,
          response,
          429,
        );
      case RouteTriggerExceptionCode.LEGACY_ROUTE_DEPRECATED:
        return this.httpExceptionHandlerService.handleError(
          exception as CustomException,
          response,
          410,
        );
      case RouteTriggerExceptionCode.LOGIC_FUNCTION_DEPENDENCIES_SIZE_EXCEEDED:
        return this.httpExceptionHandlerService.handleError(
          exception as CustomException,
          response,
          422,
          undefined,
          undefined,
          { shouldBeCapturedBySentry: false },
        );
      case RouteTriggerExceptionCode.ROUTE_TRIGGER_USER_UNCAUGHT_ERROR:
        return this.httpExceptionHandlerService.handleError(
          exception as CustomException,
          response,
          500,
          undefined,
          undefined,
          { shouldBeCapturedBySentry: false },
        );
      case RouteTriggerExceptionCode.ROUTE_TRIGGER_PLATFORM_ERROR:
        return this.httpExceptionHandlerService.handleError(
          exception as CustomException,
          response,
          500,
        );
      case RouteTriggerExceptionCode.ROUTE_ALREADY_EXIST:
      case RouteTriggerExceptionCode.ROUTE_PATH_ALREADY_EXIST:
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

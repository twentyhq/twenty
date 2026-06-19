import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
} from '@nestjs/common';

import type { Response } from 'express';

import {
  ServerWebhookTriggerException,
  ServerWebhookTriggerExceptionCode,
} from 'src/engine/core-modules/server-webhook-trigger/exceptions/server-webhook-trigger.exception';
import type { CustomException } from 'src/utils/custom-exception';
import { HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';

@Catch(ServerWebhookTriggerException)
export class ServerWebhookTriggerRestApiExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpExceptionHandlerService: HttpExceptionHandlerService,
  ) {}

  catch(exception: ServerWebhookTriggerException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    switch (exception.code) {
      case ServerWebhookTriggerExceptionCode.APPLICATION_REGISTRATION_NOT_FOUND:
      case ServerWebhookTriggerExceptionCode.SERVER_WEBHOOK_TRIGGER_NOT_CONFIGURED:
      case ServerWebhookTriggerExceptionCode.APPLICATION_NOT_INSTALLED:
      case ServerWebhookTriggerExceptionCode.LOGIC_FUNCTION_NOT_FOUND:
        return this.httpExceptionHandlerService.handleError(
          exception as CustomException,
          response,
          404,
        );
      case ServerWebhookTriggerExceptionCode.WORKSPACE_ID_NOT_RESOLVED:
        return this.httpExceptionHandlerService.handleError(
          exception as CustomException,
          response,
          400,
        );
      case ServerWebhookTriggerExceptionCode.SERVER_WEBHOOK_USER_UNCAUGHT_ERROR:
        return this.httpExceptionHandlerService.handleError(
          exception as CustomException,
          response,
          500,
          undefined,
          undefined,
          { shouldBeCapturedBySentry: false },
        );
      case ServerWebhookTriggerExceptionCode.SERVER_WEBHOOK_PLATFORM_ERROR:
        return this.httpExceptionHandlerService.handleError(
          exception as CustomException,
          response,
          500,
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

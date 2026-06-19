import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
} from '@nestjs/common';

import type { Response } from 'express';

import {
  ApplicationRegistrationWebhookException,
  ApplicationRegistrationWebhookExceptionCode,
} from 'src/engine/core-modules/application-registration-webhook/exceptions/application-registration-webhook.exception';
import type { CustomException } from 'src/utils/custom-exception';
import { HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';

@Catch(ApplicationRegistrationWebhookException)
export class ApplicationRegistrationWebhookRestApiExceptionFilter
  implements ExceptionFilter
{
  constructor(
    private readonly httpExceptionHandlerService: HttpExceptionHandlerService,
  ) {}

  catch(
    exception: ApplicationRegistrationWebhookException,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    switch (exception.code) {
      case ApplicationRegistrationWebhookExceptionCode.APPLICATION_REGISTRATION_NOT_FOUND:
      case ApplicationRegistrationWebhookExceptionCode.WEBHOOK_INGRESS_NOT_CONFIGURED:
      case ApplicationRegistrationWebhookExceptionCode.WORKSPACE_NOT_FOUND:
      case ApplicationRegistrationWebhookExceptionCode.LOGIC_FUNCTION_NOT_FOUND:
        return this.httpExceptionHandlerService.handleError(
          exception as CustomException,
          response,
          404,
        );
      case ApplicationRegistrationWebhookExceptionCode.WORKSPACE_ID_NOT_RESOLVED:
        return this.httpExceptionHandlerService.handleError(
          exception as CustomException,
          response,
          400,
        );
      case ApplicationRegistrationWebhookExceptionCode.WEBHOOK_USER_UNCAUGHT_ERROR:
        return this.httpExceptionHandlerService.handleError(
          exception as CustomException,
          response,
          500,
          undefined,
          undefined,
          { shouldBeCapturedBySentry: false },
        );
      case ApplicationRegistrationWebhookExceptionCode.WEBHOOK_PLATFORM_ERROR:
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

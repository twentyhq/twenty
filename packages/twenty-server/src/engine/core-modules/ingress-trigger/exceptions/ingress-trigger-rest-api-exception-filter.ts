import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
} from '@nestjs/common';

import type { Response } from 'express';

import {
  IngressTriggerException,
  IngressTriggerExceptionCode,
} from 'src/engine/core-modules/ingress-trigger/exceptions/ingress-trigger.exception';
import type { CustomException } from 'src/utils/custom-exception';
import { HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';

@Catch(IngressTriggerException)
export class IngressTriggerRestApiExceptionFilter
  implements ExceptionFilter
{
  constructor(
    private readonly httpExceptionHandlerService: HttpExceptionHandlerService,
  ) {}

  catch(
    exception: IngressTriggerException,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    switch (exception.code) {
      case IngressTriggerExceptionCode.APPLICATION_REGISTRATION_NOT_FOUND:
      case IngressTriggerExceptionCode.INGRESS_TRIGGER_NOT_CONFIGURED:
      case IngressTriggerExceptionCode.WORKSPACE_NOT_FOUND:
      case IngressTriggerExceptionCode.LOGIC_FUNCTION_NOT_FOUND:
        return this.httpExceptionHandlerService.handleError(
          exception as CustomException,
          response,
          404,
        );
      case IngressTriggerExceptionCode.WORKSPACE_ID_NOT_RESOLVED:
        return this.httpExceptionHandlerService.handleError(
          exception as CustomException,
          response,
          400,
        );
      case IngressTriggerExceptionCode.INGRESS_USER_UNCAUGHT_ERROR:
        return this.httpExceptionHandlerService.handleError(
          exception as CustomException,
          response,
          500,
          undefined,
          undefined,
          { shouldBeCapturedBySentry: false },
        );
      case IngressTriggerExceptionCode.INGRESS_PLATFORM_ERROR:
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

import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
} from '@nestjs/common';

import { type Response } from 'express';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';

@Catch(ApplicationException)
export class ApplicationRestApiExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpExceptionHandlerService: HttpExceptionHandlerService,
  ) {}

  catch(exception: ApplicationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    switch (exception.code) {
      case ApplicationExceptionCode.OBJECT_NOT_FOUND:
      case ApplicationExceptionCode.FIELD_NOT_FOUND:
      case ApplicationExceptionCode.ENTITY_NOT_FOUND:
      case ApplicationExceptionCode.APPLICATION_NOT_FOUND:
      case ApplicationExceptionCode.LOGIC_FUNCTION_NOT_FOUND:
      case ApplicationExceptionCode.FRONT_COMPONENT_NOT_FOUND:
        return this.httpExceptionHandlerService.handleError(
          exception,
          response,
          404,
        );
      case ApplicationExceptionCode.FORBIDDEN:
        return this.httpExceptionHandlerService.handleError(
          exception,
          response,
          403,
        );
      case ApplicationExceptionCode.INVALID_INPUT:
      case ApplicationExceptionCode.SOURCE_CHANNEL_MISMATCH:
        return this.httpExceptionHandlerService.handleError(
          exception,
          response,
          400,
        );
      case ApplicationExceptionCode.PACKAGE_RESOLUTION_FAILED:
      case ApplicationExceptionCode.INSTALL_LOCK_TIMEOUT:
      case ApplicationExceptionCode.INSTALL_HOOK_EXECUTION_FAILED:
      case ApplicationExceptionCode.TARBALL_EXTRACTION_FAILED:
      case ApplicationExceptionCode.UPGRADE_FAILED:
      default:
        return this.httpExceptionHandlerService.handleError(
          exception,
          response,
          500,
        );
    }
  }
}

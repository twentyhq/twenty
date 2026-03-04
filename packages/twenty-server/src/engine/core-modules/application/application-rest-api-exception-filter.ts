import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
} from '@nestjs/common';

import { type Response } from 'express';

import {
  ApplicationRegistrationException,
  ApplicationRegistrationExceptionCode,
} from 'src/engine/core-modules/application-registration/application-registration.exception';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';

@Catch(ApplicationException, ApplicationRegistrationException)
export class ApplicationRestApiExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpExceptionHandlerService: HttpExceptionHandlerService,
  ) {}

  catch(
    exception: ApplicationException | ApplicationRegistrationException,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof ApplicationRegistrationException) {
      return this.handleRegistrationException(exception, response);
    }

    return this.handleApplicationException(exception, response);
  }

  private handleApplicationException(
    exception: ApplicationException,
    response: Response,
  ) {
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

  private handleRegistrationException(
    exception: ApplicationRegistrationException,
    response: Response,
  ) {
    switch (exception.code) {
      case ApplicationRegistrationExceptionCode.APPLICATION_REGISTRATION_NOT_FOUND:
      case ApplicationRegistrationExceptionCode.VARIABLE_NOT_FOUND:
        return this.httpExceptionHandlerService.handleError(
          exception,
          response,
          404,
        );
      case ApplicationRegistrationExceptionCode.INVALID_INPUT:
      case ApplicationRegistrationExceptionCode.INVALID_SCOPE:
      case ApplicationRegistrationExceptionCode.INVALID_REDIRECT_URI:
      case ApplicationRegistrationExceptionCode.SOURCE_CHANNEL_MISMATCH:
      case ApplicationRegistrationExceptionCode.UNIVERSAL_IDENTIFIER_ALREADY_CLAIMED:
        return this.httpExceptionHandlerService.handleError(
          exception,
          response,
          400,
        );
      default:
        return this.httpExceptionHandlerService.handleError(
          exception,
          response,
          500,
        );
    }
  }
}

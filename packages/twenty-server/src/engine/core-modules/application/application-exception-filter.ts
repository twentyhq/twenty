import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
} from '@nestjs/common';
import { type GqlContextType } from '@nestjs/graphql';

import { type Response } from 'express';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { sendHttpExceptionResponse } from 'src/engine/core-modules/exception-handler/utils/send-http-exception-response.util';
import { convertCustomExceptionToGraphQLError } from 'src/engine/core-modules/graphql/utils/convert-custom-exception-to-graphql-error.util';
import {
  BaseGraphQLError,
  ErrorCode,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

@Catch(ApplicationException)
export class ApplicationExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  catch(exception: ApplicationException, host: ArgumentsHost) {
    if (host.getType<GqlContextType>() !== 'graphql') {
      return sendHttpExceptionResponse({
        exception,
        response: host.switchToHttp().getResponse<Response>(),
        exceptionHandlerService: this.exceptionHandlerService,
      });
    }

    if (
      exception.code !==
      ApplicationExceptionCode.APPLICATION_INSTALLATION_FAILED
    ) {
      return convertCustomExceptionToGraphQLError(exception);
    }

    const installationError = new BaseGraphQLError(
      exception,
      ErrorCode.APPLICATION_INSTALLATION_FAILED,
    );

    // Read by the Sentry driver; non-enumerable so it never reaches the client
    Object.defineProperty(installationError, 'context', {
      value: exception.context,
      enumerable: false,
    });

    return installationError;
  }
}

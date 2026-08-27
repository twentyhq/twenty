import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  type HttpException,
} from '@nestjs/common';

import { type Response } from 'express';

import { HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';
import { hasRestResponse } from 'src/engine/core-modules/exception-handler/utils/has-rest-response.util';
import { UsageLimitException } from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { usageLimitToRestApiExceptionHandler } from 'src/engine/core-modules/usage-limit/utils/usage-limit-to-rest-api-exception-handler.util';

@Catch(UsageLimitException)
export class UsageLimitRestApiExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpExceptionHandlerService: HttpExceptionHandlerService,
  ) {}

  catch(exception: UsageLimitException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // The handler's only exit is a throw carrying the REST status and body.
    let httpException: HttpException;

    try {
      return usageLimitToRestApiExceptionHandler(exception);
    } catch (converted) {
      httpException = converted as HttpException;
    }

    if (hasRestResponse(httpException)) {
      response.set(httpException.getResponseHeaders());
    }

    return this.httpExceptionHandlerService.handleError(
      httpException,
      response,
      httpException.getStatus(),
    );
  }
}

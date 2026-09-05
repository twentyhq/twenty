import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
} from '@nestjs/common';

import type { Response } from 'express';

import { UsageLimitHttpException } from 'src/engine/core-modules/usage-limit/exceptions/usage-limit-http.exception';
import { UsageLimitException } from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { buildUsageLimitHttpException } from 'src/engine/core-modules/usage-limit/utils/usage-limit-to-rest-api-exception-handler.util';

@Catch(UsageLimitException)
export class UsageLimitRestApiExceptionFilter implements ExceptionFilter {
  catch(exception: UsageLimitException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const httpException = buildUsageLimitHttpException(exception);

    if (httpException instanceof UsageLimitHttpException) {
      response.set(httpException.getResponseHeaders());

      return response
        .status(httpException.getStatus())
        .json(httpException.getResponseBody());
    }

    return response.status(httpException.getStatus()).json({
      statusCode: httpException.getStatus(),
      messages: [exception.message],
    });
  }
}

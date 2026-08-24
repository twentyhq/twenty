import { HttpException, HttpStatus } from '@nestjs/common';

import { type HttpExceptionWithResponseHeaders } from 'src/engine/core-modules/usage-limit/types/http-exception-with-response-headers.type';

export class UsageLimitHttpException
  extends HttpException
  implements HttpExceptionWithResponseHeaders
{
  private readonly responseHeaders: Record<string, string>;

  constructor(
    body: Record<string, unknown>,
    responseHeaders: Record<string, string>,
  ) {
    super(body, HttpStatus.TOO_MANY_REQUESTS);
    this.responseHeaders = responseHeaders;
  }

  getResponseHeaders(): Record<string, string> {
    return this.responseHeaders;
  }
}

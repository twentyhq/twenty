import { HttpException } from '@nestjs/common';

import { type HttpExceptionWithRestResponse } from 'src/engine/core-modules/exception-handler/types/http-exception-with-rest-response.type';
import { type UsageLimitRestResponseBody } from 'src/engine/core-modules/usage-limit/types/usage-limit-rest-response-body.type';

export class UsageLimitHttpException
  extends HttpException
  implements HttpExceptionWithRestResponse
{
  constructor(
    private readonly responseBody: UsageLimitRestResponseBody,
    private readonly responseHeaders: Record<string, string>,
  ) {
    super(responseBody, responseBody.statusCode);
    this.message = responseBody.messages[0];
  }

  getResponseBody(): UsageLimitRestResponseBody {
    return this.responseBody;
  }

  getResponseHeaders(): Record<string, string> {
    return this.responseHeaders;
  }
}

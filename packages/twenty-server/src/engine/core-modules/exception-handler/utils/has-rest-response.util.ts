import { isFunction, isObject } from '@sniptt/guards';

import { type HttpExceptionWithRestResponse } from 'src/engine/core-modules/exception-handler/types/http-exception-with-rest-response.type';

export const hasRestResponse = (
  exception: unknown,
): exception is HttpExceptionWithRestResponse =>
  isObject(exception) &&
  isFunction((exception as HttpExceptionWithRestResponse).getResponseHeaders) &&
  isFunction((exception as HttpExceptionWithRestResponse).getResponseBody);

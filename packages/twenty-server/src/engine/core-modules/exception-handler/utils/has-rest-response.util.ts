import { isFunction, isObject } from '@sniptt/guards';

import { type HttpExceptionWithRestResponse } from 'src/engine/core-modules/exception-handler/types/http-exception-with-rest-response.type';

export const hasRestResponse = (
  exception: unknown,
): exception is HttpExceptionWithRestResponse =>
  isObject(exception) &&
  'getResponseHeaders' in exception &&
  isFunction(exception.getResponseHeaders) &&
  'getResponseBody' in exception &&
  isFunction(exception.getResponseBody);

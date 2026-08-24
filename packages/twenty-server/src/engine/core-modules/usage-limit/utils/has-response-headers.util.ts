import { isFunction, isObject } from '@sniptt/guards';
import { type HttpExceptionWithResponseHeaders } from 'src/engine/core-modules/usage-limit/types/http-exception-with-response-headers.type';

export const hasResponseHeaders = (
  exception: unknown,
): exception is HttpExceptionWithResponseHeaders =>
  isObject(exception) &&
  isFunction(
    (exception as HttpExceptionWithResponseHeaders).getResponseHeaders,
  );

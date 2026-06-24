import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum ServerRouteTriggerExceptionCode {
  FEATURE_DISABLED = 'FEATURE_DISABLED',
  LOGIC_FUNCTION_NOT_FOUND = 'LOGIC_FUNCTION_NOT_FOUND',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SERVER_ROUTE_USER_UNCAUGHT_ERROR = 'SERVER_ROUTE_USER_UNCAUGHT_ERROR',
  SERVER_ROUTE_PLATFORM_ERROR = 'SERVER_ROUTE_PLATFORM_ERROR',
  RESOLVER_INVALID_RESULT = 'RESOLVER_INVALID_RESULT',
}

const getServerRouteTriggerExceptionUserFriendlyMessage = (
  code: ServerRouteTriggerExceptionCode,
) => {
  switch (code) {
    case ServerRouteTriggerExceptionCode.FEATURE_DISABLED:
      return msg`Server logic functions are disabled on this instance.`;
    case ServerRouteTriggerExceptionCode.LOGIC_FUNCTION_NOT_FOUND:
      return msg`Server logic function not found.`;
    case ServerRouteTriggerExceptionCode.RATE_LIMIT_EXCEEDED:
      return msg`Rate limit exceeded.`;
    case ServerRouteTriggerExceptionCode.SERVER_ROUTE_USER_UNCAUGHT_ERROR:
      return msg`Logic function execution failed.`;
    case ServerRouteTriggerExceptionCode.SERVER_ROUTE_PLATFORM_ERROR:
      return msg`An unexpected error occurred while handling the server route.`;
    case ServerRouteTriggerExceptionCode.RESOLVER_INVALID_RESULT:
      return msg`Resolver logic function returned an invalid result.`;
    default:
      assertUnreachable(code);
  }
};

export class ServerRouteTriggerException extends CustomException<ServerRouteTriggerExceptionCode> {
  constructor(
    message: string,
    code: ServerRouteTriggerExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getServerRouteTriggerExceptionUserFriendlyMessage(code),
    });
  }
}

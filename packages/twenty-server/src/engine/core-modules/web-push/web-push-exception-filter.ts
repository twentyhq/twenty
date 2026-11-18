import { Catch, type ExceptionFilter } from '@nestjs/common';

import { assertUnreachable } from 'twenty-shared/utils';

import {
  ForbiddenError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  WebPushException,
  WebPushExceptionCode,
} from 'src/engine/core-modules/web-push/web-push.exception';

@Catch(WebPushException)
export class WebPushExceptionFilter implements ExceptionFilter {
  catch(exception: WebPushException) {
    switch (exception.code) {
      case WebPushExceptionCode.PUSH_SUBSCRIPTION_ENDPOINT_NOT_ALLOWED:
      case WebPushExceptionCode.PUSH_SUBSCRIPTION_KEY_UNKNOWN:
      case WebPushExceptionCode.PUSH_SUBSCRIPTION_LIMIT_REACHED:
        throw new UserInputError(exception);
      case WebPushExceptionCode.PUSH_SUBSCRIPTION_ORIGIN_MISSING:
      case WebPushExceptionCode.PUSH_SUBSCRIPTION_SESSION_NOT_FOUND:
        throw new ForbiddenError(exception);
      default:
        assertUnreachable(exception.code);
    }
  }
}

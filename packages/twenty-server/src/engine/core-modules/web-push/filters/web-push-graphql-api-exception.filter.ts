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
export class WebPushGraphqlApiExceptionFilter implements ExceptionFilter {
  catch(exception: WebPushException) {
    switch (exception.code) {
      case WebPushExceptionCode.ENDPOINT_NOT_ALLOWED:
      case WebPushExceptionCode.UNKNOWN_VAPID_PUBLIC_KEY:
        throw new UserInputError(exception);
      case WebPushExceptionCode.ACTIVE_SESSION_NOT_FOUND:
        throw new ForbiddenError(exception);
      default:
        assertUnreachable(exception.code);
    }
  }
}

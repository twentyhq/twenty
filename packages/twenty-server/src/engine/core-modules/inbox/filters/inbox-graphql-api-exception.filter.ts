import { Catch, type ExceptionFilter } from '@nestjs/common';

import { assertUnreachable } from 'twenty-shared/utils';

import {
  ConflictError,
  InternalServerError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  InboxException,
  InboxExceptionCode,
} from 'src/engine/core-modules/inbox/inbox.exception';

@Catch(InboxException)
export class InboxGraphqlApiExceptionFilter implements ExceptionFilter {
  catch(exception: InboxException) {
    switch (exception.code) {
      case InboxExceptionCode.INBOX_ITEM_NOT_FOUND:
      case InboxExceptionCode.UNKNOWN_INBOX_QUEUE:
        throw new NotFoundError(exception);
      case InboxExceptionCode.INBOX_ITEM_CHANGED:
        throw new ConflictError(exception);
      case InboxExceptionCode.INVALID_INBOX_ACTION:
      case InboxExceptionCode.INVALID_INBOX_QUEUE_CHANGE:
      case InboxExceptionCode.UNKNOWN_INBOX_ITEM_TYPE:
      case InboxExceptionCode.UNKNOWN_INBOX_RECIPIENT:
      case InboxExceptionCode.INBOX_DISABLED:
        throw new UserInputError(exception);
      case InboxExceptionCode.INTERNAL_SERVER_ERROR:
        throw new InternalServerError(exception);
      default:
        assertUnreachable(exception.code);
    }
  }
}

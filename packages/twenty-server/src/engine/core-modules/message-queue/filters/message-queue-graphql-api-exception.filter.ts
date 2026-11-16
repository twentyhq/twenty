import { Catch, type ExceptionFilter } from '@nestjs/common';

import { assertUnreachable } from 'twenty-shared/utils';

import {
  BaseGraphQLError,
  ErrorCode,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  MessageQueueException,
  MessageQueueExceptionCode,
} from 'src/engine/core-modules/message-queue/message-queue.exception';

@Catch(MessageQueueException)
export class MessageQueueGraphqlApiExceptionFilter implements ExceptionFilter {
  catch(exception: MessageQueueException) {
    switch (exception.code) {
      case MessageQueueExceptionCode.JOB_TOO_LARGE: {
        const error = new UserInputError(exception);

        error.extensions = { ...error.extensions, ...exception.details };

        throw error;
      }
      case MessageQueueExceptionCode.JOB_QUEUE_MEMORY_LIMIT_REACHED: {
        const error = new BaseGraphQLError(exception, ErrorCode.RATE_LIMITED);

        error.extensions = { ...error.extensions, ...exception.details };

        throw error;
      }
      default:
        assertUnreachable(exception.code);
    }
  }
}

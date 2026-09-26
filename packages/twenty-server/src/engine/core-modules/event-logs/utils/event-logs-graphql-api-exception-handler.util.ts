/* @license Enterprise */

import { assertUnreachable } from 'twenty-shared/utils';

import {
  type EventLogsException,
  EventLogsExceptionCode,
} from 'src/engine/core-modules/event-logs/event-logs.exception';
import {
  ForbiddenError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

export const eventLogsGraphqlApiExceptionHandler = (
  exception: EventLogsException,
) => {
  switch (exception.code) {
    case EventLogsExceptionCode.CLICKHOUSE_NOT_CONFIGURED:
    case EventLogsExceptionCode.NO_ENTITLEMENT:
      throw new ForbiddenError(exception);
    case EventLogsExceptionCode.INVALID_FIELD_FILTER:
    case EventLogsExceptionCode.INVALID_SEARCH:
      throw new UserInputError(exception);
    default: {
      assertUnreachable(exception.code);
    }
  }
};

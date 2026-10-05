/* @license Enterprise */

import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import {
  CustomException,
  type ExceptionCategory,
} from 'src/utils/custom-exception';

export enum EventLogsExceptionCode {
  CLICKHOUSE_NOT_CONFIGURED = 'CLICKHOUSE_NOT_CONFIGURED',
  NO_ENTITLEMENT = 'NO_ENTITLEMENT',
  INVALID_FIELD_FILTER = 'INVALID_FIELD_FILTER',
  INVALID_TABLE = 'INVALID_TABLE',
}

const getEventLogsExceptionUserFriendlyMessage = (
  code: EventLogsExceptionCode,
) => {
  switch (code) {
    case EventLogsExceptionCode.CLICKHOUSE_NOT_CONFIGURED:
      return msg`Audit logs require ClickHouse to be configured.`;
    case EventLogsExceptionCode.NO_ENTITLEMENT:
      return msg`Audit logs require an Enterprise subscription.`;
    case EventLogsExceptionCode.INVALID_FIELD_FILTER:
      return msg`This log filter is not valid.`;
    case EventLogsExceptionCode.INVALID_TABLE:
      return msg`This log table is not valid.`;
    default:
      assertUnreachable(code);
  }
};
const EVENT_LOGS_EXCEPTION_CATEGORY_BY_CODE = {
  [EventLogsExceptionCode.CLICKHOUSE_NOT_CONFIGURED]: 'FORBIDDEN',
  [EventLogsExceptionCode.NO_ENTITLEMENT]: 'FORBIDDEN',
  [EventLogsExceptionCode.INVALID_FIELD_FILTER]: 'BAD_USER_INPUT',
  [EventLogsExceptionCode.INVALID_TABLE]: 'BAD_USER_INPUT',
} as const satisfies Record<EventLogsExceptionCode, ExceptionCategory>;

export class EventLogsException extends CustomException<EventLogsExceptionCode> {
  constructor(
    message: string,
    code: EventLogsExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getEventLogsExceptionUserFriendlyMessage(code),
      category: EVENT_LOGS_EXCEPTION_CATEGORY_BY_CODE[code],
    });
  }
}

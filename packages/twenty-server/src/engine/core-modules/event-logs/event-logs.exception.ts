/* @license Enterprise */

import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum EventLogsExceptionCode {
  CLICKHOUSE_NOT_CONFIGURED = 'CLICKHOUSE_NOT_CONFIGURED',
  NO_ENTITLEMENT = 'NO_ENTITLEMENT',
  INVALID_FIELD_FILTER = 'INVALID_FIELD_FILTER',
  INVALID_SEARCH = 'INVALID_SEARCH',
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
    case EventLogsExceptionCode.INVALID_SEARCH:
      return msg`These logs cannot be searched.`;
    default:
      assertUnreachable(code);
  }
};

export class EventLogsException extends CustomException<EventLogsExceptionCode> {
  constructor(
    message: string,
    code: EventLogsExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getEventLogsExceptionUserFriendlyMessage(code),
    });
  }
}

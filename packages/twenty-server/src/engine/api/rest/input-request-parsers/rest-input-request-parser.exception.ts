import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum RestInputRequestParserExceptionCode {
  INVALID_AGGREGATE_FIELDS_QUERY_PARAM = 'INVALID_AGGREGATE_FIELDS_QUERY_PARAM',
  INVALID_GROUP_BY_QUERY_PARAM = 'INVALID_GROUP_BY_QUERY_PARAM',
  INVALID_ORDER_BY_WITH_GROUP_BY_QUERY_PARAM = 'INVALID_ORDER_BY_WITH_GROUP_BY_QUERY_PARAM',
  INVALID_ORDER_BY_QUERY_PARAM = 'INVALID_ORDER_BY_QUERY_PARAM',
  INVALID_DEPTH_QUERY_PARAM = 'INVALID_DEPTH_QUERY_PARAM',
  INVALID_LIMIT_QUERY_PARAM = 'INVALID_LIMIT_QUERY_PARAM',
  INVALID_FILTER_QUERY_PARAM = 'INVALID_FILTER_QUERY_PARAM',
  INVALID_STARTING_AFTER_CURSOR_QUERY_PARAM = 'INVALID_STARTING_AFTER_CURSOR_QUERY_PARAM',
  INVALID_ENDING_BEFORE_CURSOR_QUERY_PARAM = 'INVALID_ENDING_BEFORE_CURSOR_QUERY_PARAM',
}

const getRestInputRequestParserExceptionUserFriendlyMessage = (
  code: RestInputRequestParserExceptionCode,
) => {
  switch (code) {
    case RestInputRequestParserExceptionCode.INVALID_AGGREGATE_FIELDS_QUERY_PARAM:
      return msg`Invalid aggregate fields parameter.`;
    case RestInputRequestParserExceptionCode.INVALID_GROUP_BY_QUERY_PARAM:
      return msg`Invalid group by parameter.`;
    case RestInputRequestParserExceptionCode.INVALID_ORDER_BY_WITH_GROUP_BY_QUERY_PARAM:
      return msg`Invalid order by with group by parameter.`;
    case RestInputRequestParserExceptionCode.INVALID_ORDER_BY_QUERY_PARAM:
      return msg`Invalid order by parameter.`;
    case RestInputRequestParserExceptionCode.INVALID_DEPTH_QUERY_PARAM:
      return msg`Invalid depth parameter.`;
    case RestInputRequestParserExceptionCode.INVALID_LIMIT_QUERY_PARAM:
      return msg`Invalid limit parameter.`;
    case RestInputRequestParserExceptionCode.INVALID_FILTER_QUERY_PARAM:
      return msg`Invalid filter parameter.`;
    case RestInputRequestParserExceptionCode.INVALID_STARTING_AFTER_CURSOR_QUERY_PARAM:
      return msg`Invalid cursor parameter. Use 'starting_after' for pagination.`;
    case RestInputRequestParserExceptionCode.INVALID_ENDING_BEFORE_CURSOR_QUERY_PARAM:
      return msg`Invalid cursor parameter. Use 'ending_before' for pagination.`;
    default:
      assertUnreachable(code);
  }
};

export class RestInputRequestParserException extends CustomException<RestInputRequestParserExceptionCode> {
  constructor(
    message: string,
    code: RestInputRequestParserExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getRestInputRequestParserExceptionUserFriendlyMessage(code),
    });
  }
}

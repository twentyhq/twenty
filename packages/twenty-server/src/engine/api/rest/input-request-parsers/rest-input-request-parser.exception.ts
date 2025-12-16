import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export enum RestInputRequestParserExceptionCode {
  INVALID_AGGREGATE_FIELDS_QUERY_PARAM = 'INVALID_AGGREGATE_FIELDS_QUERY_PARAM',
  INVALID_GROUP_BY_QUERY_PARAM = 'INVALID_GROUP_BY_QUERY_PARAM',
  INVALID_ORDER_BY_WITH_GROUP_BY_QUERY_PARAM = 'INVALID_ORDER_BY_WITH_GROUP_BY_QUERY_PARAM',
  INVALID_ORDER_BY_QUERY_PARAM = 'INVALID_ORDER_BY_QUERY_PARAM',
  INVALID_DEPTH_QUERY_PARAM = 'INVALID_DEPTH_QUERY_PARAM',
  INVALID_LIMIT_QUERY_PARAM = 'INVALID_LIMIT_QUERY_PARAM',
  INVALID_FILTER_QUERY_PARAM = 'INVALID_FILTER_QUERY_PARAM',
}

const restInputRequestParserExceptionUserFriendlyMessages: Record<
  RestInputRequestParserExceptionCode,
  MessageDescriptor
> = {
  [RestInputRequestParserExceptionCode.INVALID_AGGREGATE_FIELDS_QUERY_PARAM]: msg`Invalid aggregate fields parameter.`,
  [RestInputRequestParserExceptionCode.INVALID_GROUP_BY_QUERY_PARAM]: msg`Invalid group by parameter.`,
  [RestInputRequestParserExceptionCode.INVALID_ORDER_BY_WITH_GROUP_BY_QUERY_PARAM]: msg`Invalid order by with group by parameter.`,
  [RestInputRequestParserExceptionCode.INVALID_ORDER_BY_QUERY_PARAM]: msg`Invalid order by parameter.`,
  [RestInputRequestParserExceptionCode.INVALID_DEPTH_QUERY_PARAM]: msg`Invalid depth parameter.`,
  [RestInputRequestParserExceptionCode.INVALID_LIMIT_QUERY_PARAM]: msg`Invalid limit parameter.`,
  [RestInputRequestParserExceptionCode.INVALID_FILTER_QUERY_PARAM]: msg`Invalid filter parameter.`,
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
        restInputRequestParserExceptionUserFriendlyMessages[code],
    });
  }
}

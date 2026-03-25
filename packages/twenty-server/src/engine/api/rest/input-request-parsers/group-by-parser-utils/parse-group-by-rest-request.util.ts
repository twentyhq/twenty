import { type ObjectRecordGroupBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import {
  RestInputRequestParserException,
  RestInputRequestParserExceptionCode,
} from 'src/engine/api/rest/input-request-parsers/rest-input-request-parser.exception';
import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';

export const parseGroupByRestRequest = (
  request: AuthenticatedRequest,
): ObjectRecordGroupBy => {
  const groupByQuery = request.query.group_by;

  if (typeof groupByQuery !== 'string') {
    throw new RestInputRequestParserException(
      `Invalid group_by query parameter - should be a valid array of objects - ex: [{"firstField": true}, {"secondField": {"subField": true}}, {"dateField": {"granularity": 'DAY'}}]`,
      RestInputRequestParserExceptionCode.INVALID_GROUP_BY_QUERY_PARAM,
    );
  }

  try {
    return JSON.parse(groupByQuery);
  } catch {
    throw new RestInputRequestParserException(
      `Invalid group_by query parameter - should be a valid array of objects - ex: [{"firstField": true}, {"secondField": {"subField": true}}, {"dateField": {"granularity": 'DAY'}}]`,
      RestInputRequestParserExceptionCode.INVALID_GROUP_BY_QUERY_PARAM,
    );
  }
};

import { isDefined } from 'twenty-shared/utils';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/constants/standard-error-message.constant';
import {
  RestInputRequestParserException,
  RestInputRequestParserExceptionCode,
} from 'src/engine/api/rest/input-request-parsers/rest-input-request-parser.exception';
import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request.type';

const parseJsonArray = (value: unknown): string[] | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  try {
    const parsedValue: unknown = JSON.parse(value);

    return Array.isArray(parsedValue) ? parsedValue : undefined;
  } catch {
    return undefined;
  }
};

export const parseAggregateFieldsRestRequest = (
  request: AuthenticatedRequest,
): string[] => {
  const aggregateFieldsQuery = request.query.aggregate;

  if (!isDefined(aggregateFieldsQuery)) {
    return [];
  }

  const aggregateFields = parseJsonArray(aggregateFieldsQuery);

  if (!isDefined(aggregateFields)) {
    throw new RestInputRequestParserException(
      `Invalid aggregate query parameter - should be a valid array of string - ex: ["countNotEmptyId", "countEmptyField"]`,
      RestInputRequestParserExceptionCode.INVALID_AGGREGATE_FIELDS_QUERY_PARAM,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  return aggregateFields;
};

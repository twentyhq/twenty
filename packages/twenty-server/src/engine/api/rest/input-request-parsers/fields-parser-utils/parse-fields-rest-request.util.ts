import { isNonEmptyString, isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import {
  RestInputRequestParserException,
  RestInputRequestParserExceptionCode,
} from 'src/engine/api/rest/input-request-parsers/rest-input-request-parser.exception';
import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request.type';

export const parseFieldsRestRequest = (
  request: Pick<AuthenticatedRequest, 'query'>,
): ReadonlySet<string> | undefined => {
  const rawFields = request.query.fields;

  if (!isDefined(rawFields)) {
    return undefined;
  }

  const rawFieldsValues = Array.isArray(rawFields) ? rawFields : [rawFields];

  if (!rawFieldsValues.every(isString)) {
    throw new RestInputRequestParserException(
      `'fields' parameter invalid. Expected a comma-separated list of field names, e.g. fields=id,name`,
      RestInputRequestParserExceptionCode.INVALID_FIELDS_QUERY_PARAM,
    );
  }

  const fieldNames = [
    ...new Set(
      rawFieldsValues
        .flatMap((rawFieldsValue) => rawFieldsValue.split(','))
        .map((fieldName) => fieldName.trim())
        .filter(isNonEmptyString),
    ),
  ];

  if (fieldNames.length === 0) {
    throw new RestInputRequestParserException(
      `'fields' parameter is empty. Expected a comma-separated list of field names, e.g. fields=id,name`,
      RestInputRequestParserExceptionCode.INVALID_FIELDS_QUERY_PARAM,
    );
  }

  return new Set(fieldNames);
};

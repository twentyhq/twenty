import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  RestInputRequestParserException,
  RestInputRequestParserExceptionCode,
} from 'src/engine/api/rest/input-request-parsers/rest-input-request-parser.exception';
import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request.type';
import { isDiscoverableObject } from 'src/engine/core-modules/record-share/utils/resolve-discoverable-field-metadata-ids.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type RecordReadScope } from 'src/engine/twenty-orm/types/record-read-scope.type';

export const parseDiscoverRestRequest = (
  request: AuthenticatedRequest,
  flatObjectMetadata: FlatObjectMetadata,
): RecordReadScope => {
  const { discover } = request.query;

  if (discover === undefined || discover === 'false') {
    return 'content';
  }

  if (discover !== 'true') {
    throw new RestInputRequestParserException(
      `'discover=${discover}' parameter invalid. Allowed values are true, false`,
      RestInputRequestParserExceptionCode.INVALID_DISCOVER_QUERY_PARAM,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  if (!isDiscoverableObject(flatObjectMetadata)) {
    throw new RestInputRequestParserException(
      `'discover' parameter is only available on objects whose records can be discovered, which ${flatObjectMetadata.namePlural} are not`,
      RestInputRequestParserExceptionCode.INVALID_DISCOVER_QUERY_PARAM,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  return 'existence';
};

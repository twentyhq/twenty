import { isDefined } from 'twenty-shared/utils';

import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';

export const parseIncludeRecordsSampleRestRequest = (
  request: AuthenticatedRequest,
): boolean => {
  if (!isDefined(request.query.include_records_sample)) {
    return false;
  }

  return request.query.include_records_sample === 'true';
};

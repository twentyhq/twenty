import { isDefined } from 'twenty-shared/utils';

import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';

export const parseOmitNullValuesRestRequest = (
  request: AuthenticatedRequest,
): boolean => {
  if (!isDefined(request.query.omit_null_values)) {
    return false;
  }

  return request.query.omit_null_values === 'true';
};

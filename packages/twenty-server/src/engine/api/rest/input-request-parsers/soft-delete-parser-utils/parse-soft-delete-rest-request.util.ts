import { isDefined } from 'twenty-shared/utils';

import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';

export const parseSoftDeleteRestRequest = (
  request: AuthenticatedRequest,
): boolean => {
  if (!isDefined(request.query.softDelete)) {
    return false;
  }

  return request.query.softDelete === 'true';
};

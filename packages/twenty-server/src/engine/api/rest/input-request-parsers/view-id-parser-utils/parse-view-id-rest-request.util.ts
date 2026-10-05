import { isDefined } from 'twenty-shared/utils';

import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request.type';

export const parseViewIdRestRequest = (
  request: AuthenticatedRequest,
): string | undefined => {
  if (
    !isDefined(request.query.viewId) ||
    typeof request.query.viewId !== 'string'
  )
    return undefined;

  return request.query.viewId;
};

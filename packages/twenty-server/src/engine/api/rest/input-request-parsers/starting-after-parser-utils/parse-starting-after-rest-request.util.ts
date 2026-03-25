import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';
import { type RequestContext } from 'src/engine/api/rest/types/RequestContext';

export const parseStartingAfterRestRequest = (
  request: AuthenticatedRequest | RequestContext,
): string | undefined => {
  const cursorQuery = request.query?.starting_after;

  if (typeof cursorQuery !== 'string') {
    return undefined;
  }

  return cursorQuery;
};

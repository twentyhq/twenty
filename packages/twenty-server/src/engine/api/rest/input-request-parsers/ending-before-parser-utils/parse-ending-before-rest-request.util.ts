import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';
import { type RequestContext } from 'src/engine/api/rest/types/RequestContext';

export const parseEndingBeforeRestRequest = (
  request: AuthenticatedRequest | RequestContext,
): string | undefined => {
  const cursorQuery = request.query?.ending_before;

  if (typeof cursorQuery !== 'string') {
    return undefined;
  }

  return cursorQuery;
};

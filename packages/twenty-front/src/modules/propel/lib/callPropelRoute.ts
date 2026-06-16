import { getTokenPair } from '@/apollo/utils/getTokenPair';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

// Thin authenticated POST helper for Propel's serverless logic-function routes,
// which are served under `${base}/s<path>` (e.g. /s/marketing/analytics). Same
// auth mechanism the dialer dock uses (DialerDock.tsx ~L443): the CRM session's
// access token in an `authorization: Bearer` header; the route derives identity
// server-side from it (we never send an identity).
//
// Returns the parsed JSON body on a 2xx response, otherwise `null` — every caller
// treats `null` as "no data" and renders an empty/error state rather than throwing.
export const callPropelRoute = async <T>(
  path: string,
  body: object,
): Promise<T | null> => {
  const token = getTokenPair()?.accessOrWorkspaceAgnosticToken?.token;
  if (token === undefined || token === '') {
    return null;
  }

  try {
    const response = await fetch(`${REACT_APP_SERVER_BASE_URL}/s${path}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
};

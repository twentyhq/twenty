import { type createStore } from 'jotai';

import { isCookieAuthActiveState } from '@/auth/states/isCookieAuthActiveState';
import { tokenPairState } from '@/auth/states/tokenPairState';

type JotaiStore = ReturnType<typeof createStore>;

// Same rule as the Apollo auth link: a token pair can still be present while
// cookie auth is active and must not be sent. The server prefers Bearer over
// the session cookie, so attaching a token nothing refreshes any more
// authenticates the request with a credential that expires and never recovers.
export const getAuthorizationHeaders = (
  store: JotaiStore,
): Record<string, string> => {
  if (store.get(isCookieAuthActiveState.atom)) {
    return {};
  }

  const token = store.get(tokenPairState.atom)?.accessOrWorkspaceAgnosticToken
    ?.token;

  return token !== undefined ? { Authorization: `Bearer ${token}` } : {};
};

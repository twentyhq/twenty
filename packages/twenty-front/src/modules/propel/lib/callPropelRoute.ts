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

  // Twenty's HTTP route trigger sets `event.body` to the parsed request JSON
  // AS-IS (twenty-server build-logic-function-event.util.ts → extractBody). The
  // logic-function routes read `event.body.<field>`, so the request JSON must
  // carry the payload fields at the TOP level. Several callers historically
  // wrapped the payload one level deep as `{ body: {...} }`, which made
  // `event.body` === `{ body: {...} }` and every `event.body.<field>` read come
  // back undefined — the source of "Unknown AI action", silent save no-ops, A2A
  // actions that never fire, etc. Normalize a lone `{ body: <object> }` wrapper
  // to its inner object before sending. This is unambiguous: the only routes
  // that read `event.body.body` treat it as a STRING field (post / reply / wa
  // message text), never an object, so no real payload is shaped `{ body: {} }`.
  // PREFERRED convention going forward: pass the flat payload directly.
  const wrapped =
    Object.keys(body).length === 1 &&
    'body' in body &&
    typeof (body as { body: unknown }).body === 'object' &&
    (body as { body: unknown }).body !== null &&
    !Array.isArray((body as { body: unknown }).body);
  const payload = wrapped ? (body as { body: object }).body : body;

  try {
    const response = await fetch(`${REACT_APP_SERVER_BASE_URL}/s${path}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
};

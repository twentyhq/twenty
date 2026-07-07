import { RestApiClient } from 'twenty-client-sdk/rest';

import { resolveOwnRouteBaseUrl } from 'src/logic-functions/data/resolve-own-route-base-url.util';

const OWN_ROUTE_FLUSH_MS = 5_000;

// Fire-and-forget POST to one of this app's own HTTP routes; a timeout only
// means the request was flushed, not that the target run failed.
export const postToOwnRoute = async ({
  path,
  body,
}: {
  path: string;
  body: object;
}): Promise<boolean> => {
  try {
    const client = new RestApiClient({ baseUrl: resolveOwnRouteBaseUrl() });

    await client.post(path, body, {
      signal: AbortSignal.timeout(OWN_ROUTE_FLUSH_MS),
    });

    return true;
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === 'TimeoutError' || error.name === 'AbortError')
    ) {
      return true;
    }

    if (process.env.NODE_ENV !== 'test') {
      console.error(
        `[call-recorder] request to own route ${path} failed to fire: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    return false;
  }
};

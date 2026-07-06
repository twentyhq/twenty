import { RestApiClient } from 'twenty-client-sdk/rest';

import { resolveOwnRouteTarget } from 'src/logic-functions/data/resolve-own-route-target.util';

const OWN_ROUTE_FLUSH_MS = 5_000;

const logInfo = (message: string) => {
  if (process.env.NODE_ENV !== 'test') {
    console.info(message);
  }
};

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
    const routeTarget = await resolveOwnRouteTarget();
    const client = new RestApiClient({ baseUrl: routeTarget.baseUrl });
    const requestPath = `${routeTarget.pathPrefix}${path}`;

    logInfo(
      `[call-recorder] posting to own route ${requestPath} with ${
        Object.keys(body).length
      } body fields`,
    );

    await client.post(requestPath, body, {
      signal: AbortSignal.timeout(OWN_ROUTE_FLUSH_MS),
    });

    logInfo(`[call-recorder] own route ${requestPath} accepted request`);

    return true;
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === 'TimeoutError' || error.name === 'AbortError')
    ) {
      logInfo(
        `[call-recorder] own route ${path} did not respond within ${OWN_ROUTE_FLUSH_MS}ms; treating the request as flushed`,
      );

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

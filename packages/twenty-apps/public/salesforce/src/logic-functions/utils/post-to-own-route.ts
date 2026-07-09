import { RestApiClient } from 'twenty-client-sdk/rest';

const OWN_ROUTE_FLUSH_MS = 5_000;

// Fire-and-forget POST to one of this app's own HTTP routes. A timeout only
// means the request was flushed, not that the target run failed.
export const postToOwnRoute = async ({
  path,
  body,
}: {
  path: string;
  body: object;
}): Promise<boolean> => {
  try {
    const functionsBaseUrl = process.env.TWENTY_FUNCTIONS_URL;
    const client =
      typeof functionsBaseUrl === 'string' && functionsBaseUrl.length > 0
        ? new RestApiClient({ baseUrl: functionsBaseUrl })
        : new RestApiClient();
    const routePath =
      typeof functionsBaseUrl === 'string' && functionsBaseUrl.length > 0
        ? path
        : `/s${path}`;

    await client.post(routePath, body, {
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

    console.error(
      `Request to own route ${path} failed to fire: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );

    return false;
  }
};

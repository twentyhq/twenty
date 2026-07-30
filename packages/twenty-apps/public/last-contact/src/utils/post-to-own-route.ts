import { RestApiClient } from 'twenty-client-sdk/rest';

const OWN_ROUTE_FLUSH_MS = 5_000;

// Fire-and-forget POST to one of this app's own HTTP routes; a timeout only
// means the request was flushed, not that the target run failed.
export const postToOwnRoute = async ({
  path,
  body,
}: {
  path: string;
  body: object;
}): Promise<void> => {
  try {
    const client = new RestApiClient();

    await client.post(`/s${path}`, body, {
      signal: AbortSignal.timeout(OWN_ROUTE_FLUSH_MS),
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === 'TimeoutError' || error.name === 'AbortError')
    ) {
      return;
    }

    console.error(
      `[last-contact] request to own route ${path} failed to fire: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

export const sleep = (durationMs: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, durationMs));

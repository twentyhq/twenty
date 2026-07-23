import { RestApiClient } from 'twenty-client-sdk/rest';
import { defineLogicFunction } from 'twenty-sdk/define';

const DEFAULT_TRIGGER_COUNT = 10;
const FLUSH_TIMEOUT_MS = 1_000;

// Fire-and-forget: a timeout only means the request was flushed,
// not that the target run failed.
const fireSleep = async (client: RestApiClient): Promise<boolean> => {
  try {
    await client.post(
      '/s/sleep',
      {},
      { signal: AbortSignal.timeout(FLUSH_TIMEOUT_MS) },
    );

    return true;
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === 'TimeoutError' || error.name === 'AbortError')
    ) {
      return true;
    }

    return false;
  }
};

const handler = async (params: {
  count?: number;
  body?: { count?: number } | null;
}): Promise<{ acknowledged: number; failed: number }> => {
  const count = params?.count ?? params?.body?.count ?? DEFAULT_TRIGGER_COUNT;

  const client = new RestApiClient();

  const results = await Promise.all(
    Array.from({ length: count }, () => fireSleep(client)),
  );

  const failed = results.filter((flushed) => !flushed).length;

  return { acknowledged: count - failed, failed };
};

export default defineLogicFunction({
  universalIdentifier: '1e5327ce-1646-4923-8609-9bb6e2edcd60',
  name: 'trigger-sleep',
  description:
    'Fires the sleep logic function N times (default 10) without awaiting completion',
  timeoutSeconds: 5,
  handler,
  httpRouteTriggerSettings: {
    path: '/trigger-sleep',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});

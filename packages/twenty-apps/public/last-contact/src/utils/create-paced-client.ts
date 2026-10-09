import { type CoreApiClient } from 'twenty-client-sdk/core';

const sleep = (durationMs: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, durationMs));

export const createPacedClient = (
  client: CoreApiClient,
  minCallIntervalMs: number,
): CoreApiClient => {
  let nextCallAtMs = 0;

  const waitForTurn = async (): Promise<void> => {
    const nowMs = Date.now();
    const callAtMs = Math.max(nowMs, nextCallAtMs);

    nextCallAtMs = callAtMs + minCallIntervalMs;

    if (callAtMs > nowMs) {
      await sleep(callAtMs - nowMs);
    }
  };

  const pacedClient = Object.create(client) as CoreApiClient;

  pacedClient.query = (async (...args: Parameters<CoreApiClient['query']>) => {
    await waitForTurn();

    return client.query(...args);
  }) as CoreApiClient['query'];

  pacedClient.mutation = (async (
    ...args: Parameters<CoreApiClient['mutation']>
  ) => {
    await waitForTurn();

    return client.mutation(...args);
  }) as CoreApiClient['mutation'];

  return pacedClient;
};

import { type CoreApiClient } from 'twenty-client-sdk/core';

import { executeWithRetry } from 'src/utils/execute-with-retry';

// The server throttles application API calls with a token bucket keyed on the
// application (APPLICATION_API_RATE_LIMITING_LIMIT / _TTL_IN_MS), consuming one
// token per GraphQL root field. Mirroring the bucket client-side with a small
// safety margin lets long backfills pace themselves instead of relying on
// error-driven backoff, which would burn retries on every request once the
// bucket is empty.
const MAX_TOKENS = 450;
const TIME_WINDOW_MS = 60_000;
const REFILL_RATE_PER_MS = MAX_TOKENS / TIME_WINDOW_MS;

type ApiCall = (...args: never[]) => Promise<unknown>;

export type PacedApiClient = {
  query: CoreApiClient['query'];
  mutation: CoreApiClient['mutation'];
};

const sleep = (durationMs: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, durationMs));

const createTokenBucket = (): (() => Promise<void>) => {
  let tokens = MAX_TOKENS;
  let lastRefillAt = Date.now();
  // Acquisitions are chained so concurrent callers cannot both read the same
  // available token count and overdraw the bucket.
  let pendingAcquisitions: Promise<void> = Promise.resolve();

  const refill = (): void => {
    const now = Date.now();

    tokens = Math.min(
      MAX_TOKENS,
      tokens + (now - lastRefillAt) * REFILL_RATE_PER_MS,
    );
    lastRefillAt = now;
  };

  const consumeToken = async (): Promise<void> => {
    refill();

    if (tokens < 1) {
      await sleep(Math.ceil((1 - tokens) / REFILL_RATE_PER_MS));
      refill();
    }

    tokens -= 1;
  };

  return () => {
    const acquisition = pendingAcquisitions.then(consumeToken);

    pendingAcquisitions = acquisition.catch(() => undefined);

    return acquisition;
  };
};

export const createPacedApiClient = (client: CoreApiClient): PacedApiClient => {
  const acquireToken = createTokenBucket();

  const pace =
    (call: ApiCall) =>
    (...args: never[]) =>
      executeWithRetry(async () => {
        await acquireToken();

        return call(...args);
      });

  return {
    query: pace((...args: never[]) => client.query(...args)),
    mutation: pace((...args: never[]) => client.mutation(...args)),
  };
};

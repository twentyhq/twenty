import { CoreApiClient } from 'twenty-client-sdk/core';

// Integration tests authenticate with the workspace API key, which the server
// rate-limits per workspace (API_RATE_LIMITING_LONG_LIMIT requests per window).
// The full suite issues more API calls than one window allows, so later calls
// would fail with "Limit reached". The server refuses a throttled request
// without consuming a token and its bucket refills continuously, so waiting
// briefly frees a token. Transparently retry rate-limited SDK calls after a
// short delay — patching the client prototype once covers every test.

const RATE_LIMIT_MAX_RETRIES = 30;
const RATE_LIMIT_RETRY_DELAY_MS = 700;

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const isRateLimitError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error);
  return /limit reached|tokens per/i.test(message);
};

type AsyncMethod = (...args: unknown[]) => Promise<unknown>;

const RATE_LIMIT_PATCHED = Symbol.for('twenty-partners.rateLimitRetryPatched');

const patchMethod = (methodName: 'query' | 'mutation' | 'uploadFile'): void => {
  const prototype = CoreApiClient.prototype as unknown as Record<
    string,
    AsyncMethod
  >;
  const original = prototype[methodName];
  if (typeof original !== 'function') return;

  prototype[methodName] = async function rateLimitRetry(...args: unknown[]) {
    let attempt = 0;
    for (;;) {
      try {
        return await original.apply(this, args);
      } catch (error) {
        if (!isRateLimitError(error) || attempt >= RATE_LIMIT_MAX_RETRIES) {
          throw error;
        }
        attempt += 1;
        await sleep(RATE_LIMIT_RETRY_DELAY_MS);
      }
    }
  };
};

const clientConstructor = CoreApiClient as unknown as Record<symbol, boolean>;
if (!clientConstructor[RATE_LIMIT_PATCHED]) {
  patchMethod('query');
  patchMethod('mutation');
  patchMethod('uploadFile');
  clientConstructor[RATE_LIMIT_PATCHED] = true;
}

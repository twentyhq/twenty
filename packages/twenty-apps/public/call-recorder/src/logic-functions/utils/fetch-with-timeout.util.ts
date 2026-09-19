import { buildAbortSignalWithTimeout } from 'src/logic-functions/utils/build-abort-signal-with-timeout.util';

const REQUEST_TIMEOUT_MS = 10_000;

export const fetchWithTimeout: typeof fetch = (input, options) => {
  const signal =
    options?.signal ?? (input instanceof Request ? input.signal : undefined);

  return fetch(input, {
    ...options,
    signal: buildAbortSignalWithTimeout({
      timeoutMs: REQUEST_TIMEOUT_MS,
      signal,
    }),
  });
};

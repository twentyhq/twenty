import { isDefined } from 'twenty-sdk/utils';

import { parseRetryAfterMs } from 'src/utils/parse-retry-after-ms';
import { sleepForMilliseconds } from 'src/utils/sleep-for-milliseconds';

type FetchWithRetriesOptions = {
  sendRequest: () => Promise<Response>;
  maxAttempts: number;
  isRetryableStatus: (status: number) => boolean;
  // Returns undefined to give up and hand back the failed response.
  getRetryDelayMs: (retry: {
    attempt: number;
    retryAfterMs: number | undefined;
    waitedMs: number;
  }) => number | undefined;
  retryAbortSignal?: AbortSignal;
};

// A thrown fetch is never retried: the request may have reached the server.
export const fetchWithRetries = async ({
  sendRequest,
  maxAttempts,
  isRetryableStatus,
  getRetryDelayMs,
  retryAbortSignal,
}: FetchWithRetriesOptions): Promise<Response> => {
  const sendAttempt = async ({
    attempt,
    waitedMs,
  }: {
    attempt: number;
    waitedMs: number;
  }): Promise<Response> => {
    const response = await sendRequest();

    if (
      response.ok ||
      !isRetryableStatus(response.status) ||
      attempt + 1 >= maxAttempts
    ) {
      return response;
    }

    const delayMs = getRetryDelayMs({
      attempt,
      retryAfterMs: parseRetryAfterMs(response.headers.get('retry-after')),
      waitedMs,
    });

    if (!isDefined(delayMs)) {
      return response;
    }

    await sleepForMilliseconds(delayMs);

    if (isDefined(retryAbortSignal) && retryAbortSignal.aborted) {
      return response;
    }

    return sendAttempt({ attempt: attempt + 1, waitedMs: waitedMs + delayMs });
  };

  return sendAttempt({ attempt: 0, waitedMs: 0 });
};

import { isDefined } from 'twenty-sdk/utils';

import { getRetryDelayMs } from 'src/utils/get-retry-delay-ms';
import { parseRetryAfterMs } from 'src/utils/parse-retry-after-ms';
import { sleepForMilliseconds } from 'src/utils/sleep-for-milliseconds';

type RetryableResponse = Pick<Response, 'ok' | 'status' | 'headers'>;

// Resolves with the last response, failed or not. A thrown sendRequest is never retried:
// a send that timed out may have been delivered.
export const requestWithRetries = async <TResponse extends RetryableResponse>({
  sendRequest,
  isRetryableStatus,
  maxAttempts,
  baseDelayMs,
  jitterRatio = 0,
  minRetryAfterDelayMs = 0,
  maxTotalWaitMs = Number.POSITIVE_INFINITY,
  timeoutMs,
  shouldParseRetryAfterHttpDate = false,
  retryAbortSignal,
}: {
  sendRequest: (timeoutSignal: AbortSignal | undefined) => Promise<TResponse>;
  isRetryableStatus: (status: number) => boolean;
  maxAttempts: number;
  baseDelayMs: number;
  jitterRatio?: number;
  minRetryAfterDelayMs?: number;
  maxTotalWaitMs?: number;
  timeoutMs?: number;
  shouldParseRetryAfterHttpDate?: boolean;
  retryAbortSignal?: AbortSignal;
}): Promise<TResponse> => {
  // Attempts and waits share one timeout, so retries never outlast what callers budget for a single call.
  const deadlineAtMs = isDefined(timeoutMs)
    ? Date.now() + timeoutMs
    : undefined;

  const attemptRequest = async ({
    attempt,
    waitedMs,
  }: {
    attempt: number;
    waitedMs: number;
  }): Promise<TResponse> => {
    const response = await sendRequest(
      isDefined(deadlineAtMs)
        ? AbortSignal.timeout(Math.max(deadlineAtMs - Date.now(), 1))
        : undefined,
    );

    if (
      response.ok ||
      !isRetryableStatus(response.status) ||
      attempt + 1 >= maxAttempts
    ) {
      return response;
    }

    const delayMs = getRetryDelayMs({
      attempt,
      retryAfterMs: parseRetryAfterMs({
        retryAfter: response.headers.get('retry-after'),
        shouldParseHttpDate: shouldParseRetryAfterHttpDate,
      }),
      baseDelayMs,
      jitterRatio,
      minRetryAfterDelayMs,
      maxDelayMs: maxTotalWaitMs - waitedMs,
    });

    if (
      delayMs <= 0 ||
      (isDefined(deadlineAtMs) && Date.now() + delayMs >= deadlineAtMs)
    ) {
      return response;
    }

    await sleepForMilliseconds(delayMs);

    if (isDefined(retryAbortSignal) && retryAbortSignal.aborted) {
      return response;
    }

    return attemptRequest({
      attempt: attempt + 1,
      waitedMs: waitedMs + delayMs,
    });
  };

  return attemptRequest({ attempt: 0, waitedMs: 0 });
};

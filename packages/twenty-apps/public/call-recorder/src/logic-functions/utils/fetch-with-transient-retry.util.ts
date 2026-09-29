import { fetchWithTimeout } from 'src/logic-functions/utils/fetch-with-timeout.util';

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1_000;
const TRANSIENT_HTTP_STATUSES = [502, 503, 504];

const sleep = (delayMs: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });

const resolveRetryDelayMs = (attemptNumber: number): number =>
  Math.round((RETRY_DELAY_MS * attemptNumber * (1 + Math.random())) / 2);

const fetchWithTransientRetryAttempt = async ({
  input,
  options,
  attemptNumber,
}: {
  input: Parameters<typeof fetch>[0];
  options: Parameters<typeof fetch>[1];
  attemptNumber: number;
}): Promise<Response> => {
  const hasAttemptsLeft = attemptNumber < MAX_ATTEMPTS;

  try {
    const response = await fetchWithTimeout(input, options);

    if (
      !hasAttemptsLeft ||
      !TRANSIENT_HTTP_STATUSES.includes(response.status)
    ) {
      return response;
    }

    await response.body?.cancel();
  } catch (error) {
    if (!hasAttemptsLeft || options?.signal?.aborted) {
      throw error;
    }
  }

  await sleep(resolveRetryDelayMs(attemptNumber));

  return fetchWithTransientRetryAttempt({
    input,
    options,
    attemptNumber: attemptNumber + 1,
  });
};

export const fetchWithTransientRetry: typeof fetch = (input, options) =>
  fetchWithTransientRetryAttempt({ input, options, attemptNumber: 1 });

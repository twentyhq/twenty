export const createDeadlineBoundFetch =
  ({
    deadlineAtMs,
    maxRequestMilliseconds = Number.POSITIVE_INFINITY,
  }: {
    deadlineAtMs: number;
    maxRequestMilliseconds?: number;
  }) =>
  (input: RequestInfo | URL, init?: RequestInit): Promise<Response> =>
    fetch(input, {
      ...init,
      signal: AbortSignal.timeout(
        Math.max(
          Math.min(maxRequestMilliseconds, deadlineAtMs - Date.now()),
          1,
        ),
      ),
    });

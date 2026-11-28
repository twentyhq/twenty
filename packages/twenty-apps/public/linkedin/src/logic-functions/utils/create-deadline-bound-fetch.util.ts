export const createDeadlineBoundFetch =
  (deadlineAtMs: number, maxRequestMilliseconds = Number.POSITIVE_INFINITY) =>
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

export const raceAgainstTimeoutOrThrow = async <TResult>({
  promise,
  timeoutMs,
  timeoutError,
}: {
  promise: Promise<TResult>;
  timeoutMs: number;
  timeoutError: Error;
}): Promise<TResult> => {
  const timeoutController = new AbortController();
  const timer = setTimeout(() => timeoutController.abort(), timeoutMs);
  const timeout = new Promise<never>((_, reject) => {
    timeoutController.signal.addEventListener('abort', () =>
      reject(timeoutError),
    );
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer);
  }
};

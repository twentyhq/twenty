export const racePromiseAgainstTimeout = async <TResult>({
  promise,
  timeoutMs,
  timedOutResult,
}: {
  promise: Promise<TResult>;
  timeoutMs: number;
  timedOutResult: TResult;
}): Promise<TResult> => {
  let timeoutTimer: ReturnType<typeof setTimeout> | undefined;

  const timedOut = new Promise<TResult>((resolve) => {
    timeoutTimer = setTimeout(
      () => resolve(timedOutResult),
      Math.max(timeoutMs, 0),
    );
  });

  try {
    return await Promise.race([promise, timedOut]);
  } finally {
    clearTimeout(timeoutTimer);
  }
};

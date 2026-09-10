export const runWithTimeout = async <TValue>({
  operation,
  timeoutMs,
  buildTimeoutValue,
}: {
  operation: Promise<TValue>;
  timeoutMs: number;
  buildTimeoutValue: () => TValue;
}): Promise<TValue> => {
  let timeoutTimer: ReturnType<typeof setTimeout> | undefined;

  const timeoutValue = new Promise<TValue>((resolve) => {
    timeoutTimer = setTimeout(() => resolve(buildTimeoutValue()), timeoutMs);
  });

  try {
    return await Promise.race([operation, timeoutValue]);
  } finally {
    clearTimeout(timeoutTimer);
  }
};

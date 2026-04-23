export const callWithTimeout = async <T>({
  callback,
  timeoutMs,
}: {
  callback: () => Promise<T>;
  timeoutMs: number;
}): Promise<T> => {
  return Promise.race([
    callback(),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Execution timed out')), timeoutMs),
    ),
  ]);
};

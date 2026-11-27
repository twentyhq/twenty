export const withTimeout = <TValue>({
  run,
  timeoutInMs,
  timeoutMessage,
}: {
  run: (abortSignal: AbortSignal) => Promise<TValue>;
  timeoutInMs: number;
  timeoutMessage: string;
}): Promise<TValue> =>
  new Promise<TValue>((resolve, reject) => {
    const abortController = new AbortController();

    const timeoutId = setTimeout(() => {
      abortController.abort();
      reject(new Error(timeoutMessage));
    }, timeoutInMs);

    run(abortController.signal).then(
      (value) => {
        clearTimeout(timeoutId);
        resolve(value);
      },
      (error) => {
        clearTimeout(timeoutId);
        reject(error);
      },
    );
  });

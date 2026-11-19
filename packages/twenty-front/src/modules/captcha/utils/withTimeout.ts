export const withTimeout = <TValue>({
  promise,
  timeoutInMs,
  timeoutMessage,
}: {
  promise: Promise<TValue>;
  timeoutInMs: number;
  timeoutMessage: string;
}): Promise<TValue> =>
  new Promise<TValue>((resolve, reject) => {
    const timeoutId = setTimeout(
      () => reject(new Error(timeoutMessage)),
      timeoutInMs,
    );

    promise.then(resolve, reject).finally(() => clearTimeout(timeoutId));
  });

export const withInventoryTimeout = async <TResult>({
  operation,
  timeout,
  label,
}: {
  operation: Promise<TResult>;
  timeout: number;
  label: string;
}): Promise<TResult> => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      operation,
      new Promise<never>((_resolve, reject) => {
        timer = setTimeout(
          () => reject(new Error(`${label} timed out after ${timeout}ms`)),
          timeout,
        );
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
};

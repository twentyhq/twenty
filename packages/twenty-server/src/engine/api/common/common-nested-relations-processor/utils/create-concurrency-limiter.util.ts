export type ConcurrencyLimiter = <T>(task: () => Promise<T>) => Promise<T>;

export const createConcurrencyLimiter = (
  maxConcurrency: number,
): ConcurrencyLimiter => {
  if (!Number.isInteger(maxConcurrency) || maxConcurrency < 1) {
    throw new Error('Maximum concurrency must be a positive integer');
  }

  let activeTaskCount = 0;
  const waitingTaskResolvers: Array<() => void> = [];

  const acquire = (): Promise<void> => {
    if (activeTaskCount < maxConcurrency) {
      activeTaskCount++;

      return Promise.resolve();
    }

    return new Promise((resolve) => {
      waitingTaskResolvers.push(resolve);
    });
  };

  const release = () => {
    const nextTaskResolver = waitingTaskResolvers.shift();

    if (nextTaskResolver) {
      nextTaskResolver();

      return;
    }

    activeTaskCount--;
  };

  return async <T>(task: () => Promise<T>): Promise<T> => {
    await acquire();

    try {
      return await task();
    } finally {
      release();
    }
  };
};

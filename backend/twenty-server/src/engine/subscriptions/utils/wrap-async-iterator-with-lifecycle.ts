import { isDefined } from 'twenty-shared/utils';

type AsyncIteratorLifecycleOptions<T> = {
  initialValue?: T;
  onHeartbeat?: () => Promise<boolean>;
  heartbeatIntervalMs?: number;
  onCleanup?: () => Promise<void>;
};

export function wrapAsyncIteratorWithLifecycle<T>(
  iterator: AsyncIterableIterator<T>,
  options: AsyncIteratorLifecycleOptions<T>,
): AsyncIterableIterator<T> {
  const { initialValue, onHeartbeat, heartbeatIntervalMs, onCleanup } = options;
  let heartbeatInterval: NodeJS.Timeout | null = null;
  let hasYieldedInitialValue = false;

  const startHeartbeat = () => {
    if (onHeartbeat && heartbeatIntervalMs) {
      heartbeatInterval = setInterval(async () => {
        try {
          await onHeartbeat();
        } catch {
          // Heartbeat failure shouldn't crash the stream
        }
      }, heartbeatIntervalMs);
    }
  };

  const cleanup = async () => {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
    if (onCleanup) {
      await onCleanup();
    }
  };

  return {
    next: async () => {
      if (!isDefined(heartbeatInterval)) {
        startHeartbeat();
      }

      if (isDefined(initialValue) && !hasYieldedInitialValue) {
        hasYieldedInitialValue = true;

        return { done: false, value: initialValue };
      }

      let result: IteratorResult<T>;

      try {
        result = await iterator.next();
      } catch (error) {
        await cleanup();

        throw error;
      }

      if (result.done) {
        await cleanup();
      }

      return result;
    },
    return: async () => {
      let result: IteratorResult<T>;

      try {
        await cleanup();
      } finally {
        result = (await iterator.return?.()) ?? {
          done: true,
          value: undefined,
        };
      }

      return result;
    },
    throw: async (error) => {
      await cleanup();
      if (iterator.throw) {
        return iterator.throw(error);
      }
      throw error;
    },
    [Symbol.asyncIterator]() {
      return this;
    },
  };
}

import { type RemoteConnection } from '@remote-dom/core/elements';
import { isPlainObject } from 'twenty-shared/utils';

const MAX_BATCH_SIZE = 100000;
const MAX_RENDER_OPERATIONS_PER_SECOND = 1000000;
const MAX_HOST_CALLS_PER_SECOND = 10000;
const MAX_STRING_LENGTH = 1000000;

export const createBoundedRemoteConnection = (
  connection: RemoteConnection,
  onLimitReached: () => void,
): RemoteConnection => {
  let remainingOperations = MAX_RENDER_OPERATIONS_PER_SECOND;
  let remainingCalls = MAX_HOST_CALLS_PER_SECOND;
  let previousRefill = performance.now();
  let stopped = false;

  const stop = () => {
    if (!stopped) {
      stopped = true;
      onLimitReached();
    }
    return false;
  };
  const consumeBudget = (values: readonly unknown[]) => {
    if (stopped) {
      return false;
    }
    const now = performance.now();
    const elapsedSeconds = Math.max(0, now - previousRefill) / 1000;
    previousRefill = now;
    remainingOperations = Math.min(
      MAX_RENDER_OPERATIONS_PER_SECOND,
      remainingOperations + elapsedSeconds * MAX_RENDER_OPERATIONS_PER_SECOND,
    );
    remainingCalls = Math.min(
      MAX_HOST_CALLS_PER_SECOND,
      remainingCalls + elapsedSeconds * MAX_HOST_CALLS_PER_SECOND,
    );
    if (values.length > MAX_BATCH_SIZE) {
      return stop();
    }
    const pending: unknown[] = [...values];
    let batchSize = 0;

    while (pending.length > 0) {
      const value = pending.pop();

      batchSize += 1;
      remainingOperations -= 1;
      if (
        batchSize > MAX_BATCH_SIZE ||
        remainingOperations < 0 ||
        (typeof value === 'string' && value.length > MAX_STRING_LENGTH)
      ) {
        return stop();
      }
      const children = Array.isArray(value)
        ? value
        : isPlainObject(value)
          ? Object.values(value)
          : [];
      if (pending.length + children.length > MAX_BATCH_SIZE) {
        return stop();
      }
      for (const child of children) {
        pending.push(child);
      }
    }
    return true;
  };

  return {
    call: (...args) => {
      if (!consumeBudget(args)) {
        return;
      }
      if (remainingCalls < 1) {
        stop();
        return;
      }
      remainingCalls -= 1;
      return connection.call(...args);
    },
    mutate: (records) => {
      if (consumeBudget(records)) {
        connection.mutate(records);
      }
    },
  };
};

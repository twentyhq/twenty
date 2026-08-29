import { createConcurrencyLimiter } from 'src/engine/api/common/common-nested-relations-processor/utils/create-concurrency-limiter.util';

const createDeferred = <T>() => {
  let resolve: (value: T | PromiseLike<T>) => void;
  let reject: (reason?: unknown) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return { promise, resolve: resolve!, reject: reject! };
};

describe('createConcurrencyLimiter', () => {
  it('should limit concurrent tasks and start queued tasks in order', async () => {
    const limitConcurrency = createConcurrencyLimiter(4);
    const startedTaskIndexes: number[] = [];
    const taskStartedDeferreds = Array.from({ length: 8 }, () =>
      createDeferred<void>(),
    );
    const taskFinishedDeferreds = Array.from({ length: 8 }, () =>
      createDeferred<void>(),
    );
    let activeTaskCount = 0;
    let maximumActiveTaskCount = 0;

    const tasks = Array.from({ length: 8 }, (_, taskIndex) =>
      limitConcurrency(async () => {
        startedTaskIndexes.push(taskIndex);
        activeTaskCount++;
        maximumActiveTaskCount = Math.max(
          maximumActiveTaskCount,
          activeTaskCount,
        );
        taskStartedDeferreds[taskIndex].resolve();

        await taskFinishedDeferreds[taskIndex].promise;

        activeTaskCount--;

        return taskIndex;
      }),
    );

    await Promise.all(
      taskStartedDeferreds.slice(0, 4).map(({ promise }) => promise),
    );

    expect(startedTaskIndexes).toEqual([0, 1, 2, 3]);
    expect(activeTaskCount).toBe(4);

    for (let taskIndex = 0; taskIndex < 8; taskIndex++) {
      await taskStartedDeferreds[taskIndex].promise;
      taskFinishedDeferreds[taskIndex].resolve();
    }

    await expect(Promise.all(tasks)).resolves.toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(startedTaskIndexes).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(maximumActiveTaskCount).toBe(4);
  });

  it('should release capacity after a task rejects', async () => {
    const limitConcurrency = createConcurrencyLimiter(1);
    const rejectedTask = limitConcurrency(async () => {
      throw new Error('Task failed');
    });
    const nextTask = limitConcurrency(async () => 'completed');

    await expect(rejectedTask).rejects.toThrow('Task failed');
    await expect(nextTask).resolves.toBe('completed');
  });

  it('should not share capacity between limiter instances', async () => {
    const firstLimiter = createConcurrencyLimiter(1);
    const secondLimiter = createConcurrencyLimiter(1);
    const firstTaskFinished = createDeferred<void>();
    const firstTask = firstLimiter(async () => {
      await firstTaskFinished.promise;
    });

    await expect(secondLimiter(async () => 'completed')).resolves.toBe(
      'completed',
    );

    firstTaskFinished.resolve();
    await firstTask;
  });

  it('should reject invalid concurrency values', () => {
    expect(() => createConcurrencyLimiter(0)).toThrow(
      'Maximum concurrency must be a positive integer',
    );
    expect(() => createConcurrencyLimiter(1.5)).toThrow(
      'Maximum concurrency must be a positive integer',
    );
  });
});

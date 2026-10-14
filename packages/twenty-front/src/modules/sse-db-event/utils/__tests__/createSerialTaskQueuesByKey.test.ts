import { createSerialTaskQueuesByKey } from '@/sse-db-event/utils/createSerialTaskQueuesByKey';

const createDeferred = () => {
  let resolve: () => void = () => {};
  let reject: (error: Error) => void = () => {};

  const promise = new Promise<void>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, resolve, reject };
};

describe('createSerialTaskQueuesByKey', () => {
  it('should start a task only once the previous one with the same key has settled', async () => {
    const queues = createSerialTaskQueuesByKey();
    const firstTask = createDeferred();
    const startedTasks: string[] = [];

    void queues.enqueue({
      key: 'event-stream-1',
      task: () => {
        startedTasks.push('first');

        return firstTask.promise;
      },
    });

    const secondTaskDone = queues.enqueue({
      key: 'event-stream-1',
      task: async () => {
        startedTasks.push('second');
      },
    });

    await Promise.resolve();

    expect(startedTasks).toEqual(['first']);

    firstTask.resolve();
    await secondTaskDone;

    expect(startedTasks).toEqual(['first', 'second']);
  });

  it('should not make a task wait for a pending task with another key', async () => {
    const queues = createSerialTaskQueuesByKey();
    const pendingTask = createDeferred();
    const otherKeyTask = jest.fn(async () => {});

    void queues.enqueue({
      key: 'event-stream-1',
      task: () => pendingTask.promise,
    });
    await queues.enqueue({ key: 'event-stream-2', task: otherKeyTask });

    expect(otherKeyTask).toHaveBeenCalledTimes(1);
  });

  it('should keep running tasks after one fails', async () => {
    const queues = createSerialTaskQueuesByKey();
    const failingTask = createDeferred();
    const nextTask = jest.fn(async () => {});

    const failingTaskDone = queues.enqueue({
      key: 'event-stream-1',
      task: () => failingTask.promise,
    });
    const nextTaskDone = queues.enqueue({
      key: 'event-stream-1',
      task: nextTask,
    });

    failingTask.reject(new Error('Network error'));

    await expect(failingTaskDone).rejects.toThrow('Network error');
    await nextTaskDone;

    expect(nextTask).toHaveBeenCalledTimes(1);
  });
});

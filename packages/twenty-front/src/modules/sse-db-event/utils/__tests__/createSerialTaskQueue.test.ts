import { createSerialTaskQueue } from '@/sse-db-event/utils/createSerialTaskQueue';

const createDeferred = () => {
  let resolve: () => void = () => {};
  let reject: (error: Error) => void = () => {};

  const promise = new Promise<void>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, resolve, reject };
};

describe('createSerialTaskQueue', () => {
  it('should start a task only once the previous one has settled', async () => {
    const queue = createSerialTaskQueue();
    const firstTask = createDeferred();
    const startedTasks: string[] = [];

    void queue.enqueue(() => {
      startedTasks.push('first');

      return firstTask.promise;
    });

    const secondTaskDone = queue.enqueue(async () => {
      startedTasks.push('second');
    });

    await Promise.resolve();

    expect(startedTasks).toEqual(['first']);

    firstTask.resolve();
    await secondTaskDone;

    expect(startedTasks).toEqual(['first', 'second']);
  });

  it('should keep running tasks after one fails', async () => {
    const queue = createSerialTaskQueue();
    const failingTask = createDeferred();
    const nextTask = jest.fn(async () => {});

    const failingTaskDone = queue.enqueue(() => failingTask.promise);
    const nextTaskDone = queue.enqueue(nextTask);

    failingTask.reject(new Error('Network error'));

    await expect(failingTaskDone).rejects.toThrow('Network error');
    await nextTaskDone;

    expect(nextTask).toHaveBeenCalledTimes(1);
  });
});

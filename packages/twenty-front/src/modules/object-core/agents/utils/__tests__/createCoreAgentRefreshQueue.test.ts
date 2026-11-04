import { createCoreAgentRefreshQueue } from '@/object-core/agents/utils/createCoreAgentRefreshQueue';

const createRefreshGate = () => {
  let release = () => {};
  let reject = (_error: Error) => {};
  const promise = new Promise<void>((resolve, rejectPromise) => {
    release = resolve;
    reject = rejectPromise;
  });

  return { promise, release, reject };
};

it('coalesces overlapping invalidations into a fresh trailing request before settling callers', async () => {
  const firstRequest = createRefreshGate();
  const finalRequest = createRefreshGate();
  const refresh = jest
    .fn()
    .mockReturnValueOnce(firstRequest.promise)
    .mockReturnValueOnce(finalRequest.promise);
  const requestRefresh = createCoreAgentRefreshQueue(refresh);

  const firstRefresh = requestRefresh();
  await Promise.resolve();
  const deletionRefresh = requestRefresh();
  const metadataRefresh = requestRefresh();
  const finished = jest.fn();
  void deletionRefresh.then(finished);

  firstRequest.release();
  await Promise.resolve();
  expect(refresh).toHaveBeenCalledTimes(2);
  expect(finished).not.toHaveBeenCalled();

  finalRequest.release();
  await Promise.all([firstRefresh, deletionRefresh, metadataRefresh]);
  expect(finished).toHaveBeenCalledTimes(1);
});

it('runs the queued post-deletion refresh even if the earlier event refresh fails', async () => {
  const firstRequest = createRefreshGate();
  const refresh = jest
    .fn()
    .mockReturnValueOnce(firstRequest.promise)
    .mockResolvedValue(undefined);
  const requestRefresh = createCoreAgentRefreshQueue(refresh);

  const firstRefresh = requestRefresh();
  await Promise.resolve();
  const deletionRefresh = requestRefresh();
  firstRequest.reject(new Error('Connection lost'));

  await expect(Promise.all([firstRefresh, deletionRefresh])).resolves.toEqual([
    undefined,
    undefined,
  ]);
  expect(refresh).toHaveBeenCalledTimes(2);
});

it.each(['synchronous', 'asynchronous'])(
  'allows retry after %s terminal refresh failure',
  async (failureMode) => {
    const refresh = jest
      .fn()
      .mockImplementationOnce(() => {
        const error = new Error('Connection lost');

        if (failureMode === 'synchronous') {
          throw error;
        }

        return Promise.reject(error);
      })
      .mockResolvedValue(undefined);
    const requestRefresh = createCoreAgentRefreshQueue(refresh);

    await expect(requestRefresh()).rejects.toThrow('Connection lost');
    await expect(requestRefresh()).resolves.toBeUndefined();
  },
);

import { waitFor } from '@testing-library/react';

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

describe('createCoreAgentRefreshQueue', () => {
  it('joins overlapping requests into one fresh refresh started after the running one', async () => {
    const runningRequest = createRefreshGate();
    const trailingRequest = createRefreshGate();
    const refresh = jest
      .fn()
      .mockReturnValueOnce(runningRequest.promise)
      .mockReturnValueOnce(trailingRequest.promise);
    const requestRefresh = createCoreAgentRefreshQueue(refresh);

    const eventRefresh = requestRefresh();
    await waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));
    const deletionRefresh = requestRefresh();
    const reconnectRefresh = requestRefresh();
    const onDeletionRefreshed = jest.fn();
    void deletionRefresh.then(onDeletionRefreshed);

    runningRequest.release();
    await eventRefresh;
    await waitFor(() => expect(refresh).toHaveBeenCalledTimes(2));
    expect(onDeletionRefreshed).not.toHaveBeenCalled();

    trailingRequest.release();
    await Promise.all([deletionRefresh, reconnectRefresh]);
    expect(refresh).toHaveBeenCalledTimes(2);
  });

  it('settles a request when its refresh finishes even if newer requests arrive meanwhile', async () => {
    const runningRequest = createRefreshGate();
    const deletionRequest = createRefreshGate();
    const laterRequest = createRefreshGate();
    const refresh = jest
      .fn()
      .mockReturnValueOnce(runningRequest.promise)
      .mockReturnValueOnce(deletionRequest.promise)
      .mockReturnValueOnce(laterRequest.promise);
    const requestRefresh = createCoreAgentRefreshQueue(refresh);

    void requestRefresh();
    await waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));
    const deletionRefresh = requestRefresh();
    runningRequest.release();
    await waitFor(() => expect(refresh).toHaveBeenCalledTimes(2));
    const laterRefresh = requestRefresh();

    deletionRequest.release();
    await expect(deletionRefresh).resolves.toBeUndefined();

    await waitFor(() => expect(refresh).toHaveBeenCalledTimes(3));
    laterRequest.release();
    await expect(laterRefresh).resolves.toBeUndefined();
  });

  it('runs the queued refresh even if the running refresh fails', async () => {
    const runningRequest = createRefreshGate();
    const refresh = jest
      .fn()
      .mockReturnValueOnce(runningRequest.promise)
      .mockResolvedValue(undefined);
    const requestRefresh = createCoreAgentRefreshQueue(refresh);

    const eventRefresh = requestRefresh();
    await waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));
    const deletionRefresh = requestRefresh();
    runningRequest.reject(new Error('Connection lost'));

    await expect(eventRefresh).rejects.toThrow('Connection lost');
    await expect(deletionRefresh).resolves.toBeUndefined();
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
});

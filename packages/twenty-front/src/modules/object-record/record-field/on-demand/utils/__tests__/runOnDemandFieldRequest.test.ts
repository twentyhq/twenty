import { type OnDemandFieldLoadResult } from '@/object-record/record-field/on-demand/types/OnDemandFieldLoadResult';
import { runOnDemandFieldRequest } from '@/object-record/record-field/on-demand/utils/runOnDemandFieldRequest';
import { createStore } from 'jotai';

const createPendingRequest = () => {
  let resolve: (result: OnDemandFieldLoadResult) => void = jest.fn();
  const promise = new Promise<OnDemandFieldLoadResult>((resolvePromise) => {
    resolve = resolvePromise;
  });

  return { promise, resolve };
};

describe('runOnDemandFieldRequest', () => {
  it('shares one pending load across cells showing the same field', async () => {
    const store = createStore();
    const requestOwner = {};
    const pendingRequest = createPendingRequest();
    const loadValue = jest.fn(() => pendingRequest.promise);
    const request = {
      store,
      requestOwner,
      requestKey: 'record:field',
      loadValue,
    };

    const firstResult = runOnDemandFieldRequest(request);
    const secondResult = runOnDemandFieldRequest(request);

    await Promise.resolve();

    expect(loadValue).toHaveBeenCalledTimes(1);

    pendingRequest.resolve('loaded');

    await expect(Promise.all([firstResult, secondResult])).resolves.toEqual([
      'loaded',
      'loaded',
    ]);
  });

  it('loads again after a settled request instead of reusing an old value', async () => {
    const store = createStore();
    const requestOwner = {};
    const loadValue = jest.fn<Promise<OnDemandFieldLoadResult>, []>();
    const request = {
      store,
      requestOwner,
      requestKey: 'record:field',
      loadValue,
    };

    loadValue.mockResolvedValueOnce('loaded').mockResolvedValueOnce('missing');

    await expect(runOnDemandFieldRequest(request)).resolves.toBe('loaded');
    await expect(runOnDemandFieldRequest(request)).resolves.toBe('missing');

    expect(loadValue).toHaveBeenCalledTimes(2);
  });

  it('does not share loads for different fields or stores', async () => {
    const store = createStore();
    const requestOwner = {};
    const pendingRequest = createPendingRequest();
    const loadValue = jest.fn(() => pendingRequest.promise);
    const request = {
      store,
      requestOwner,
      requestKey: 'record:field',
      loadValue,
    };

    const results = [
      runOnDemandFieldRequest(request),
      runOnDemandFieldRequest({ ...request, requestKey: 'other-record:field' }),
      runOnDemandFieldRequest({ ...request, requestKey: 'record:other-field' }),
      runOnDemandFieldRequest({ ...request, store: createStore() }),
    ];

    await Promise.resolve();

    expect(loadValue).toHaveBeenCalledTimes(4);

    pendingRequest.resolve('loaded');

    await expect(Promise.all(results)).resolves.toEqual([
      'loaded',
      'loaded',
      'loaded',
      'loaded',
    ]);
  });

  it('keeps a newer owner request pending when the previous owner finishes', async () => {
    const store = createStore();
    const olderPendingRequest = createPendingRequest();
    const currentPendingRequest = createPendingRequest();
    const currentOwner = {};
    const loadCurrentValue = jest.fn(() => currentPendingRequest.promise);
    const currentRequest = {
      store,
      requestOwner: currentOwner,
      requestKey: 'record:field',
      loadValue: loadCurrentValue,
    };

    const olderResult = runOnDemandFieldRequest({
      ...currentRequest,
      requestOwner: {},
      loadValue: () => olderPendingRequest.promise,
    });
    const currentResult = runOnDemandFieldRequest(currentRequest);

    olderPendingRequest.resolve('stale');

    await expect(olderResult).resolves.toBe('stale');

    const repeatedCurrentResult = runOnDemandFieldRequest(currentRequest);

    await Promise.resolve();

    expect(loadCurrentValue).toHaveBeenCalledTimes(1);

    currentPendingRequest.resolve('loaded');

    await expect(
      Promise.all([currentResult, repeatedCurrentResult]),
    ).resolves.toEqual(['loaded', 'loaded']);
  });

  it('releases failed requests so retry can start a new load', async () => {
    const store = createStore();
    const requestOwner = {};
    const loadValue = jest.fn<Promise<OnDemandFieldLoadResult>, []>();
    const request = {
      store,
      requestOwner,
      requestKey: 'record:field',
      loadValue,
    };

    loadValue
      .mockRejectedValueOnce(new Error('Request failed'))
      .mockResolvedValueOnce('loaded');

    await expect(runOnDemandFieldRequest(request)).rejects.toThrow(
      'Request failed',
    );
    await expect(runOnDemandFieldRequest(request)).resolves.toBe('loaded');

    expect(loadValue).toHaveBeenCalledTimes(2);
  });
});

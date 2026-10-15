import { createApplicationTranslationCatalogStore } from '@/front-components/utils/createApplicationTranslationCatalogStore';

const flushRequests = async () => {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
};

beforeEach(() => jest.useFakeTimers({ doNotFake: ['queueMicrotask'] }));
afterEach(() => jest.useRealTimers());

it('deduplicates subscribers and queues one refresh for invalidations received in flight', async () => {
  const pending: Array<(catalog: Record<string, string>) => void> = [];
  const load = jest.fn(
    () =>
      new Promise<Record<string, string>>((resolve) => pending.push(resolve)),
  );
  const store = createApplicationTranslationCatalogStore({
    load,
    onUnused: jest.fn(),
  });
  const unsubscribe = Array.from({ length: 100 }, () =>
    store.subscribe(jest.fn()),
  );
  await flushRequests();
  expect(load).toHaveBeenCalledTimes(1);
  store.invalidate();
  store.invalidate();
  store.invalidate();
  await flushRequests();
  expect(load).toHaveBeenCalledTimes(1);
  pending[0]({ greeting: 'Older' });
  await flushRequests();
  expect(load).toHaveBeenCalledTimes(2);
  pending[1]({ greeting: 'Current' });
  await flushRequests();
  expect(store.getSnapshot().translationCatalog).toEqual({
    greeting: 'Current',
  });
  for (const removeListener of unsubscribe) {
    removeListener();
  }
});

it('keeps the last good catalog on failure and clears it after a successful empty response', async () => {
  const load = jest
    .fn<Promise<Record<string, string>>, []>()
    .mockResolvedValueOnce({ greeting: 'Bonjour' })
    .mockRejectedValueOnce(new Error('Unavailable'))
    .mockResolvedValueOnce({});
  const store = createApplicationTranslationCatalogStore({
    load,
    onUnused: jest.fn(),
  });
  const unsubscribe = store.subscribe(jest.fn());
  await flushRequests();
  store.invalidate();
  await flushRequests();
  expect(store.getSnapshot()).toEqual({
    translationCatalog: { greeting: 'Bonjour' },
    isWaitingForInitialCatalog: false,
  });
  store.invalidate();
  await flushRequests();
  expect(store.getSnapshot().translationCatalog).toEqual({});
  unsubscribe();
});

it('ends the initial wait after 500ms without discarding a late catalog', async () => {
  const pending: Array<(catalog: Record<string, string>) => void> = [];
  const store = createApplicationTranslationCatalogStore({
    load: () => new Promise((resolve) => pending.push(resolve)),
    onUnused: jest.fn(),
  });
  const unsubscribe = store.subscribe(jest.fn());
  await flushRequests();
  jest.advanceTimersByTime(499);
  expect(store.getSnapshot().isWaitingForInitialCatalog).toBe(true);
  jest.advanceTimersByTime(1);
  expect(store.getSnapshot().isWaitingForInitialCatalog).toBe(false);
  pending[0]({ greeting: 'Late' });
  await flushRequests();
  expect(store.getSnapshot().translationCatalog).toEqual({ greeting: 'Late' });
  unsubscribe();
});

it('expires unused catalogs, cancels expiry on remount, and never restores an evicted in-flight store', async () => {
  const onUnused = jest.fn();
  const pending: Array<(catalog: Record<string, string>) => void> = [];
  const load = jest.fn(
    () =>
      new Promise<Record<string, string>>((resolve) => pending.push(resolve)),
  );
  const store = createApplicationTranslationCatalogStore({ load, onUnused });
  const unsubscribe = store.subscribe(jest.fn());
  await flushRequests();
  unsubscribe();
  jest.advanceTimersByTime(4 * 60 * 1000);
  const unsubscribeAgain = store.subscribe(jest.fn());
  jest.advanceTimersByTime(2 * 60 * 1000);
  expect(onUnused).not.toHaveBeenCalled();
  expect(load).toHaveBeenCalledTimes(1);
  unsubscribeAgain();
  jest.advanceTimersByTime(5 * 60 * 1000);
  expect(onUnused).toHaveBeenCalledTimes(1);
  pending[0]({ greeting: 'Finished after eviction' });
  await flushRequests();
  expect(onUnused).toHaveBeenCalledTimes(1);
  expect(load).toHaveBeenCalledTimes(1);
});

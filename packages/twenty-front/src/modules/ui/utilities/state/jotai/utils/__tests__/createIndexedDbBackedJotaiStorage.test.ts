import { clear, createStore, del, entries, get, set } from 'idb-keyval';

import { createIndexedDbBackedJotaiStorage } from '@/ui/utilities/state/jotai/utils/createIndexedDbBackedJotaiStorage';
import { isIndexedDbAvailable } from '@/ui/utilities/state/jotai/utils/isIndexedDbAvailable';
import { logError } from '~/utils/logError';

jest.mock('idb-keyval', () => ({
  createStore: jest.fn(() => ({ store: 'mock' })),
  set: jest.fn(() => Promise.resolve()),
  del: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  entries: jest.fn(() => Promise.resolve([])),
  get: jest.fn(() => Promise.resolve(undefined)),
}));
jest.mock('@/ui/utilities/state/jotai/utils/isIndexedDbAvailable');
jest.mock('~/utils/logError');

const mockedSet = jest.mocked(set);
const mockedDel = jest.mocked(del);
const mockedClear = jest.mocked(clear);
const mockedEntries = jest.mocked(entries);
const mockedGet = jest.mocked(get);
const mockedCreateStore = jest.mocked(createStore);
const mockedIsIndexedDbAvailable = jest.mocked(isIndexedDbAvailable);
const mockedLogError = jest.mocked(logError);

const flushMicrotasks = () => new Promise((resolve) => setTimeout(resolve, 0));

type Item = { value: number };

const INITIAL: Item = { value: 0 };

describe('createIndexedDbBackedJotaiStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockedIsIndexedDbAvailable.mockReturnValue(true);
    mockedEntries.mockResolvedValue([]);
  });

  it('should use a database namespaced to the cache name', () => {
    createIndexedDbBackedJotaiStorage<Item>('metadata-store');

    expect(mockedCreateStore).toHaveBeenCalledWith(
      'twenty-front-metadata-store',
      'keyval',
    );
  });

  it('should read synchronously from the in-memory map', () => {
    const { storage } = createIndexedDbBackedJotaiStorage<Item>('test');

    expect(storage.getItem('k', INITIAL)).toBe(INITIAL);

    storage.setItem('k', { value: 1 });

    expect(storage.getItem('k', INITIAL)).toEqual({ value: 1 });
  });

  it('should distinguish a stored undefined value from a missing key', () => {
    const { storage } = createIndexedDbBackedJotaiStorage<number | undefined>(
      'test',
    );

    expect(storage.getItem('k', 0)).toBe(0);

    storage.setItem('k', undefined);

    expect(storage.getItem('k', 0)).toBeUndefined();
  });

  it('should write through to IndexedDB on set', () => {
    const { storage } = createIndexedDbBackedJotaiStorage<Item>('test');

    storage.setItem('k', { value: 2 });

    expect(mockedSet).toHaveBeenCalledWith(
      'k',
      { value: 2 },
      expect.anything(),
    );
  });

  it('should hydrate the in-memory map from IndexedDB', async () => {
    mockedEntries.mockResolvedValue([['k', { value: 7 }]]);

    const { storage, hydrate } =
      createIndexedDbBackedJotaiStorage<Item>('test');

    await hydrate();

    expect(storage.getItem('k', INITIAL)).toEqual({ value: 7 });
  });

  it('should delete from the map and IndexedDB on removeItem', () => {
    const { storage } = createIndexedDbBackedJotaiStorage<Item>('test');

    storage.setItem('k', { value: 1 });
    storage.removeItem('k');

    expect(storage.getItem('k', INITIAL)).toBe(INITIAL);
    expect(mockedDel).toHaveBeenCalledWith('k', expect.anything());
  });

  it('should clear the map and IndexedDB', async () => {
    const { storage, clear: clearStorage } =
      createIndexedDbBackedJotaiStorage<Item>('test');

    storage.setItem('k', { value: 1 });
    await clearStorage();

    expect(storage.getItem('k', INITIAL)).toBe(INITIAL);
    expect(mockedClear).toHaveBeenCalled();
  });

  it('should register and unregister cross-tab subscribers cleanly', () => {
    const { storage } = createIndexedDbBackedJotaiStorage<Item>('test');

    const callback = jest.fn();
    const unsubscribe = storage.subscribe?.('k', callback, INITIAL);

    expect(typeof unsubscribe).toBe('function');
    expect(() => unsubscribe?.()).not.toThrow();
  });

  it('should keep the value in memory and log when a persist fails', async () => {
    mockedSet.mockRejectedValueOnce(new Error('write failed'));

    const { storage } = createIndexedDbBackedJotaiStorage<Item>('test');

    expect(() => storage.setItem('k', { value: 1 })).not.toThrow();
    expect(storage.getItem('k', INITIAL)).toEqual({ value: 1 });

    await flushMicrotasks();

    expect(mockedLogError).toHaveBeenCalled();
  });

  describe('when IndexedDB is unavailable', () => {
    beforeEach(() => {
      mockedIsIndexedDbAvailable.mockReturnValue(false);
    });

    it('should keep values in memory only, without persisting anywhere', () => {
      const { storage } = createIndexedDbBackedJotaiStorage<Item>('test');

      storage.setItem('k', { value: 5 });

      expect(storage.getItem('k', INITIAL)).toEqual({ value: 5 });
      expect(mockedCreateStore).not.toHaveBeenCalled();
      expect(mockedSet).not.toHaveBeenCalled();
      expect(localStorage.getItem('k')).toBeNull();
    });
  });

  describe('versioned storage', () => {
    it('should clear persisted entries when the stored version differs', async () => {
      mockedGet.mockResolvedValue(1);
      mockedEntries.mockResolvedValue([['someKey', { value: 42 }]]);

      const { storage, hydrate } = createIndexedDbBackedJotaiStorage<Item>(
        'metadata-store',
        { version: 2 },
      );

      await hydrate();

      expect(mockedClear).toHaveBeenCalled();
      expect(mockedSet).toHaveBeenCalledWith(
        '__storageVersion',
        2,
        expect.anything(),
      );
      expect(storage.getItem('someKey', INITIAL)).toEqual(INITIAL);
    });

    it('should load persisted entries when the stored version matches', async () => {
      mockedGet.mockResolvedValue(2);
      mockedEntries.mockResolvedValue([
        ['someKey', { value: 42 }],
        ['__storageVersion', 2 as unknown as Item],
      ]);

      const { storage, hydrate } = createIndexedDbBackedJotaiStorage<Item>(
        'metadata-store',
        { version: 2 },
      );

      await hydrate();

      expect(mockedClear).not.toHaveBeenCalled();
      expect(storage.getItem('someKey', INITIAL)).toEqual({ value: 42 });
      expect(storage.getItem('__storageVersion', INITIAL)).toEqual(INITIAL);
    });

    it('should not read a version when none is configured', async () => {
      const { hydrate } =
        createIndexedDbBackedJotaiStorage<Item>('metadata-store');

      await hydrate();

      expect(mockedGet).not.toHaveBeenCalled();
      expect(mockedClear).not.toHaveBeenCalled();
    });
  });
});

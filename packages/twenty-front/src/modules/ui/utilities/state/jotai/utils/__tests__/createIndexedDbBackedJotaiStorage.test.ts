import { clear, del, entries, set } from 'idb-keyval';

import { createIndexedDbBackedJotaiStorage } from '@/ui/utilities/state/jotai/utils/createIndexedDbBackedJotaiStorage';

jest.mock('idb-keyval', () => ({
  createStore: jest.fn(() => ({ store: 'mock' })),
  set: jest.fn(() => Promise.resolve()),
  del: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  entries: jest.fn(() => Promise.resolve([])),
}));

const mockedSet = jest.mocked(set);
const mockedDel = jest.mocked(del);
const mockedClear = jest.mocked(clear);
const mockedEntries = jest.mocked(entries);

const setIndexedDbAvailability = (isAvailable: boolean) => {
  Object.defineProperty(globalThis, 'indexedDB', {
    configurable: true,
    value: isAvailable ? {} : undefined,
  });
};

type Item = { value: number };

const INITIAL: Item = { value: 0 };

describe('createIndexedDbBackedJotaiStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    setIndexedDbAvailability(true);
    mockedEntries.mockResolvedValue([]);
  });

  it('should read synchronously from the in-memory map', () => {
    const { storage } = createIndexedDbBackedJotaiStorage<Item>();

    expect(storage.getItem('k', INITIAL)).toBe(INITIAL);

    storage.setItem('k', { value: 1 });

    expect(storage.getItem('k', INITIAL)).toEqual({ value: 1 });
  });

  it('should write through to IndexedDB on set', () => {
    const { storage } = createIndexedDbBackedJotaiStorage<Item>();

    storage.setItem('k', { value: 2 });

    expect(mockedSet).toHaveBeenCalledWith(
      'k',
      { value: 2 },
      expect.anything(),
    );
  });

  it('should hydrate the in-memory map from IndexedDB', async () => {
    mockedEntries.mockResolvedValue([['k', { value: 7 }]]);

    const { storage, hydrate } = createIndexedDbBackedJotaiStorage<Item>();

    await hydrate();

    expect(storage.getItem('k', INITIAL)).toEqual({ value: 7 });
  });

  it('should migrate legacy localStorage keys when IndexedDB is empty, then free them', async () => {
    localStorage.setItem('legacy', JSON.stringify({ value: 42 }));

    const { storage, hydrate } = createIndexedDbBackedJotaiStorage<Item>({
      migrateFromLocalStorageKeys: ['legacy'],
    });

    await hydrate();

    expect(storage.getItem('legacy', INITIAL)).toEqual({ value: 42 });
    expect(mockedSet).toHaveBeenCalledWith(
      'legacy',
      { value: 42 },
      expect.anything(),
    );
    // localStorage quota is freed once IndexedDB owns the data.
    expect(localStorage.getItem('legacy')).toBeNull();
  });

  it('should not overwrite existing IndexedDB data with legacy localStorage, but still free it', async () => {
    mockedEntries.mockResolvedValue([['legacy', { value: 99 }]]);
    localStorage.setItem('legacy', JSON.stringify({ value: 1 }));

    const { storage, hydrate } = createIndexedDbBackedJotaiStorage<Item>({
      migrateFromLocalStorageKeys: ['legacy'],
    });

    await hydrate();

    expect(storage.getItem('legacy', INITIAL)).toEqual({ value: 99 });
    expect(mockedSet).not.toHaveBeenCalled();
    expect(localStorage.getItem('legacy')).toBeNull();
  });

  it('should delete from the map and IndexedDB on removeItem', () => {
    const { storage } = createIndexedDbBackedJotaiStorage<Item>();

    storage.setItem('k', { value: 1 });
    storage.removeItem('k');

    expect(storage.getItem('k', INITIAL)).toBe(INITIAL);
    expect(mockedDel).toHaveBeenCalledWith('k', expect.anything());
  });

  it('should clear the map and IndexedDB', async () => {
    const { storage, clear: clearStorage } =
      createIndexedDbBackedJotaiStorage<Item>();

    storage.setItem('k', { value: 1 });
    await clearStorage();

    expect(storage.getItem('k', INITIAL)).toBe(INITIAL);
    expect(mockedClear).toHaveBeenCalled();
  });

  it('should notify cross-tab subscribers and unregister cleanly', () => {
    const { storage } = createIndexedDbBackedJotaiStorage<Item>();

    const callback = jest.fn();
    const unsubscribe = storage.subscribe?.('k', callback, INITIAL);

    expect(typeof unsubscribe).toBe('function');
    expect(() => unsubscribe?.()).not.toThrow();
  });

  describe('when IndexedDB is unavailable', () => {
    beforeEach(() => {
      setIndexedDbAvailability(false);
    });

    it('should fall back to localStorage for persistence', () => {
      const { storage } = createIndexedDbBackedJotaiStorage<Item>();

      storage.setItem('k', { value: 5 });

      expect(mockedSet).not.toHaveBeenCalled();
      expect(localStorage.getItem('k')).toBe(JSON.stringify({ value: 5 }));
    });

    it('should hydrate from the legacy localStorage snapshot', async () => {
      localStorage.setItem('legacy', JSON.stringify({ value: 11 }));

      const { storage, hydrate } = createIndexedDbBackedJotaiStorage<Item>({
        migrateFromLocalStorageKeys: ['legacy'],
      });

      await hydrate();

      expect(storage.getItem('legacy', INITIAL)).toEqual({ value: 11 });
      // Without IndexedDB we keep the localStorage data as the fallback store.
      expect(localStorage.getItem('legacy')).not.toBeNull();
    });
  });
});

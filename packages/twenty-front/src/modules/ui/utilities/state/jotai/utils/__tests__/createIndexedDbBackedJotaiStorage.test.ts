import { createIndexedDbBackedJotaiStorage } from '@/ui/utilities/state/jotai/utils/createIndexedDbBackedJotaiStorage';
import {
  idbClear,
  idbDelete,
  idbGetAllEntries,
  idbSet,
  isIndexedDbAvailable,
} from '@/ui/utilities/state/jotai/utils/indexedDbKeyValStore';

jest.mock('@/ui/utilities/state/jotai/utils/indexedDbKeyValStore');

const mockedIsIndexedDbAvailable = jest.mocked(isIndexedDbAvailable);
const mockedIdbGetAllEntries = jest.mocked(idbGetAllEntries);
const mockedIdbSet = jest.mocked(idbSet);
const mockedIdbDelete = jest.mocked(idbDelete);
const mockedIdbClear = jest.mocked(idbClear);

type Item = { value: number };

const INITIAL: Item = { value: 0 };

describe('createIndexedDbBackedJotaiStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockedIsIndexedDbAvailable.mockReturnValue(true);
    mockedIdbGetAllEntries.mockResolvedValue([]);
    mockedIdbSet.mockResolvedValue(undefined);
    mockedIdbDelete.mockResolvedValue(undefined);
    mockedIdbClear.mockResolvedValue(undefined);
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

    expect(mockedIdbSet).toHaveBeenCalledWith('k', { value: 2 });
  });

  it('should hydrate the in-memory map from IndexedDB', async () => {
    mockedIdbGetAllEntries.mockResolvedValue([['k', { value: 7 }]]);

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
    expect(mockedIdbSet).toHaveBeenCalledWith('legacy', { value: 42 });
    // localStorage quota is freed once IndexedDB owns the data.
    expect(localStorage.getItem('legacy')).toBeNull();
  });

  it('should not overwrite existing IndexedDB data with legacy localStorage, but still free it', async () => {
    mockedIdbGetAllEntries.mockResolvedValue([['legacy', { value: 99 }]]);
    localStorage.setItem('legacy', JSON.stringify({ value: 1 }));

    const { storage, hydrate } = createIndexedDbBackedJotaiStorage<Item>({
      migrateFromLocalStorageKeys: ['legacy'],
    });

    await hydrate();

    expect(storage.getItem('legacy', INITIAL)).toEqual({ value: 99 });
    expect(mockedIdbSet).not.toHaveBeenCalled();
    expect(localStorage.getItem('legacy')).toBeNull();
  });

  it('should delete from the map and IndexedDB on removeItem', () => {
    const { storage } = createIndexedDbBackedJotaiStorage<Item>();

    storage.setItem('k', { value: 1 });
    storage.removeItem('k');

    expect(storage.getItem('k', INITIAL)).toBe(INITIAL);
    expect(mockedIdbDelete).toHaveBeenCalledWith('k');
  });

  it('should clear the map and IndexedDB', async () => {
    const { storage, clear } = createIndexedDbBackedJotaiStorage<Item>();

    storage.setItem('k', { value: 1 });
    await clear();

    expect(storage.getItem('k', INITIAL)).toBe(INITIAL);
    expect(mockedIdbClear).toHaveBeenCalled();
  });

  it('should register and unregister cross-tab subscribers without throwing', () => {
    const { storage } = createIndexedDbBackedJotaiStorage<Item>();

    const callback = jest.fn();
    const unsubscribe = storage.subscribe?.('k', callback, INITIAL);

    expect(typeof unsubscribe).toBe('function');
    expect(() => unsubscribe?.()).not.toThrow();
  });

  describe('when IndexedDB is unavailable', () => {
    beforeEach(() => {
      mockedIsIndexedDbAvailable.mockReturnValue(false);
    });

    it('should fall back to localStorage for persistence', () => {
      const { storage } = createIndexedDbBackedJotaiStorage<Item>();

      storage.setItem('k', { value: 5 });

      expect(mockedIdbSet).not.toHaveBeenCalled();
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

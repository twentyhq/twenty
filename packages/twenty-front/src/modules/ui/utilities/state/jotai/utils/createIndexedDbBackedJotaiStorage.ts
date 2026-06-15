import {
  idbClear,
  idbDelete,
  idbGetAllEntries,
  idbSet,
  isIndexedDbAvailable,
} from '@/ui/utilities/state/jotai/utils/indexedDbKeyValStore';

// Jotai's synchronous storage contract. We must stay synchronous (no Promise
// from getItem) so consumers reading the atoms with useAtomValue never suspend.
type JotaiSyncStorage<ValueType> = {
  getItem: (key: string, initialValue: ValueType) => ValueType;
  setItem: (key: string, newValue: ValueType) => void;
  removeItem: (key: string) => void;
};

export type IndexedDbBackedJotaiStorage<ValueType> = {
  storage: JotaiSyncStorage<ValueType>;
  // Loads the persisted snapshot into the in-memory map. Must be awaited before
  // the React tree mounts so that atoms with getOnInit:true hydrate from it.
  hydrate: () => Promise<void>;
  // Wipes both the in-memory map and the persisted store (used on logout).
  clear: () => Promise<void>;
};

// A synchronous Jotai storage whose source of truth is an in-memory map that is
// hydrated once (asynchronously) from IndexedDB at boot and written through to
// IndexedDB on every set. This lets us move a large cache off the 5MB
// localStorage ceiling while keeping a fully synchronous read path.
//
// When IndexedDB is unavailable (sandbox / disabled storage) we transparently
// fall back to localStorage so persistence still works where it did before.
export const createIndexedDbBackedJotaiStorage = <ValueType>(options?: {
  // Legacy localStorage keys to migrate into IndexedDB once, then delete to free
  // up the localStorage quota.
  migrateFromLocalStorageKeys?: string[];
}): IndexedDbBackedJotaiStorage<ValueType> => {
  const memoryMap = new Map<string, ValueType>();
  const usesIndexedDb = isIndexedDbAvailable();
  let isHydrated = false;

  const writeToLocalStorageFallback = (key: string, value: ValueType): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Quota exceeded / disabled: keep the in-memory value only.
    }
  };

  const storage: JotaiSyncStorage<ValueType> = {
    getItem: (key, initialValue) =>
      memoryMap.has(key) ? (memoryMap.get(key) as ValueType) : initialValue,
    setItem: (key, newValue) => {
      memoryMap.set(key, newValue);

      if (usesIndexedDb) {
        void idbSet(key, newValue);
      } else {
        writeToLocalStorageFallback(key, newValue);
      }
    },
    removeItem: (key) => {
      memoryMap.delete(key);

      if (usesIndexedDb) {
        void idbDelete(key);
      } else {
        try {
          localStorage.removeItem(key);
        } catch {
          // noop
        }
      }
    },
  };

  const migrateLegacyLocalStorageKeys = (hasExistingIdbData: boolean): void => {
    const legacyKeys = options?.migrateFromLocalStorageKeys;

    if (legacyKeys === undefined) {
      return;
    }

    for (const key of legacyKeys) {
      let rawValue: string | null = null;

      try {
        rawValue = localStorage.getItem(key);
      } catch {
        continue;
      }

      if (rawValue === null) {
        continue;
      }

      // Only adopt the legacy value when IndexedDB has no snapshot yet, so we
      // never clobber fresher IndexedDB data with stale localStorage data.
      if (!hasExistingIdbData) {
        try {
          const parsedValue = JSON.parse(rawValue) as ValueType;
          memoryMap.set(key, parsedValue);
          void idbSet(key, parsedValue);
        } catch {
          // Corrupted legacy value: drop it.
        }
      }

      // Always free the localStorage quota once IndexedDB is the source of truth.
      try {
        localStorage.removeItem(key);
      } catch {
        // noop
      }
    }
  };

  const hydrate = async (): Promise<void> => {
    if (isHydrated) {
      return;
    }

    if (!usesIndexedDb) {
      // Fallback path: read the legacy localStorage snapshot into memory so
      // cache-first boot still works where IndexedDB is unavailable.
      for (const key of options?.migrateFromLocalStorageKeys ?? []) {
        try {
          const rawValue = localStorage.getItem(key);

          if (rawValue !== null) {
            memoryMap.set(key, JSON.parse(rawValue) as ValueType);
          }
        } catch {
          // Skip corrupted entries.
        }
      }

      isHydrated = true;
      return;
    }

    const entries = await idbGetAllEntries();

    for (const [key, value] of entries) {
      memoryMap.set(key, value as ValueType);
    }

    migrateLegacyLocalStorageKeys(entries.length > 0);

    isHydrated = true;
  };

  const clear = async (): Promise<void> => {
    memoryMap.clear();

    if (usesIndexedDb) {
      await idbClear();
    }
  };

  return { storage, hydrate, clear };
};

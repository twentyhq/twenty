import {
  idbClear,
  idbDelete,
  idbGetAllEntries,
  idbSet,
  isIndexedDbAvailable,
} from '@/ui/utilities/state/jotai/utils/indexedDbKeyValStore';

// Jotai's synchronous storage contract. We must stay synchronous (no Promise
// from getItem) so consumers reading the atoms with useAtomValue never suspend.
// `subscribe` is how atomWithStorage reactively syncs an atom when the backing
// store changes — we use it to propagate cross-tab writes (the IndexedDB facade
// has no equivalent of localStorage's `storage` event).
type JotaiSyncStorage<ValueType> = {
  getItem: (key: string, initialValue: ValueType) => ValueType;
  setItem: (key: string, newValue: ValueType) => void;
  removeItem: (key: string) => void;
  subscribe?: (
    key: string,
    callback: (value: ValueType) => void,
    initialValue: ValueType,
  ) => () => void;
};

const CROSS_TAB_SYNC_CHANNEL_NAME = 'twenty-front-cache-sync';

type CrossTabMessage =
  | { type: 'set'; key: string; value: unknown }
  | { type: 'remove'; key: string };

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

  // Per-key subscribers used by atomWithStorage to react to cross-tab writes.
  const subscribers = new Map<string, Set<(value: ValueType) => void>>();

  // BroadcastChannel does not deliver a tab its own messages, so there is no
  // feedback loop. Absent in some environments (older jsdom) — guard it.
  const broadcastChannel: BroadcastChannel | null = (() => {
    try {
      return typeof BroadcastChannel !== 'undefined'
        ? new BroadcastChannel(CROSS_TAB_SYNC_CHANNEL_NAME)
        : null;
    } catch {
      return null;
    }
  })();

  if (broadcastChannel !== null) {
    broadcastChannel.onmessage = (event: MessageEvent<CrossTabMessage>) => {
      const message = event.data;

      if (message.type === 'set') {
        memoryMap.set(message.key, message.value as ValueType);
      } else {
        memoryMap.delete(message.key);
      }

      const keySubscribers = subscribers.get(message.key);

      if (keySubscribers !== undefined) {
        const nextValue =
          message.type === 'set'
            ? (message.value as ValueType)
            : (memoryMap.get(message.key) as ValueType);

        for (const callback of keySubscribers) {
          callback(nextValue);
        }
      }
    };
  }

  const broadcast = (message: CrossTabMessage): void => {
    try {
      broadcastChannel?.postMessage(message);
    } catch {
      // Value not structured-cloneable / channel closed: skip cross-tab sync.
    }
  };

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
      broadcast({ type: 'set', key, value: newValue });

      if (usesIndexedDb) {
        void idbSet(key, newValue);
      } else {
        writeToLocalStorageFallback(key, newValue);
      }
    },
    removeItem: (key) => {
      memoryMap.delete(key);
      broadcast({ type: 'remove', key });

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
    subscribe: (key, callback) => {
      const keySubscribers = subscribers.get(key) ?? new Set();
      keySubscribers.add(callback);
      subscribers.set(key, keySubscribers);

      return () => {
        keySubscribers.delete(callback);

        if (keySubscribers.size === 0) {
          subscribers.delete(key);
        }
      };
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

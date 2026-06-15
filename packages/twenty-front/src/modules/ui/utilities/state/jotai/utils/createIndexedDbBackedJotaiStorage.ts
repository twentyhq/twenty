import {
  clear as idbClear,
  createStore,
  del as idbDelete,
  entries as idbEntries,
  set as idbSet,
  type UseStore,
} from 'idb-keyval';
import { isDefined, parseJson } from 'twenty-shared/utils';

import { type JotaiSyncStorage } from '@/ui/utilities/state/jotai/types/JotaiSyncStorage';

const INDEXED_DB_NAME = 'twenty-front-cache';
const INDEXED_DB_STORE_NAME = 'keyval';
const CROSS_TAB_SYNC_CHANNEL_NAME = 'twenty-front-cache-sync';

type CrossTabMessage<ValueType> =
  | { type: 'set'; key: string; value: ValueType }
  | { type: 'remove'; key: string };

type CrossTabSubscriber<ValueType> = {
  callback: (value: ValueType) => void;
  initialValue: ValueType;
};

type IndexedDbBackedJotaiStorage<ValueType> = {
  storage: JotaiSyncStorage<ValueType>;
  // Loads the persisted snapshot into the in-memory map. Must be awaited before
  // the React tree mounts so that atoms with getOnInit:true hydrate from it.
  hydrate: () => Promise<void>;
  // Wipes both the in-memory map and the persisted store (used on logout).
  clear: () => Promise<void>;
};

const isIndexedDbAvailable = (): boolean => {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null;
  } catch {
    // Accessing indexedDB can throw in sandboxed iframes / disabled storage.
    return false;
  }
};

const readLocalStorageItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const removeLocalStorageItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch {
    // noop
  }
};

// A synchronous Jotai storage whose source of truth is an in-memory map that is
// hydrated once (asynchronously) from IndexedDB at boot and written through to
// IndexedDB on every set. This lets us move a large cache off the 5MB
// localStorage ceiling (Safari's per-origin cap) while keeping a fully
// synchronous read path, and keeps tabs in sync via a BroadcastChannel.
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
  const idbStore: UseStore | undefined = usesIndexedDb
    ? createStore(INDEXED_DB_NAME, INDEXED_DB_STORE_NAME)
    : undefined;
  let isHydrated = false;

  // Write failed (quota / blocked): the in-memory map keeps the session working
  // and the value re-persists on the next change.
  const persist = (operation: Promise<unknown>): void => {
    void operation.catch(() => {});
  };

  // Per-key subscribers used by atomWithStorage to react to cross-tab writes.
  const subscribers = new Map<string, Set<CrossTabSubscriber<ValueType>>>();

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
    broadcastChannel.onmessage = (
      event: MessageEvent<CrossTabMessage<ValueType>>,
    ) => {
      const message = event.data;

      if (message.type === 'set') {
        memoryMap.set(message.key, message.value);
      } else {
        memoryMap.delete(message.key);
      }

      const keySubscribers = subscribers.get(message.key);

      if (isDefined(keySubscribers)) {
        for (const subscriber of keySubscribers) {
          subscriber.callback(
            message.type === 'set' ? message.value : subscriber.initialValue,
          );
        }
      }
    };
  }

  const broadcast = (message: CrossTabMessage<ValueType>): void => {
    try {
      broadcastChannel?.postMessage(message);
    } catch {
      // Value not structured-cloneable / channel closed: skip cross-tab sync.
    }
  };

  const storage: JotaiSyncStorage<ValueType> = {
    getItem: (key, initialValue) => {
      const storedValue = memoryMap.get(key);

      return storedValue === undefined ? initialValue : storedValue;
    },
    setItem: (key, newValue) => {
      memoryMap.set(key, newValue);
      broadcast({ type: 'set', key, value: newValue });

      if (isDefined(idbStore)) {
        persist(idbSet(key, newValue, idbStore));
      } else {
        // No IndexedDB: fall back to localStorage so persistence still works.
        try {
          localStorage.setItem(key, JSON.stringify(newValue));
        } catch {
          // Quota exceeded / disabled: keep the in-memory value only.
        }
      }
    },
    removeItem: (key) => {
      memoryMap.delete(key);
      broadcast({ type: 'remove', key });

      if (isDefined(idbStore)) {
        persist(idbDelete(key, idbStore));
      } else {
        removeLocalStorageItem(key);
      }
    },
    subscribe: (key, callback, initialValue) => {
      const keySubscribers = subscribers.get(key) ?? new Set();
      const subscriber: CrossTabSubscriber<ValueType> = {
        callback,
        initialValue,
      };
      keySubscribers.add(subscriber);
      subscribers.set(key, keySubscribers);

      return () => {
        keySubscribers.delete(subscriber);

        if (keySubscribers.size === 0) {
          subscribers.delete(key);
        }
      };
    },
  };

  const migrateLegacyLocalStorageKeys = (hasExistingIdbData: boolean): void => {
    for (const key of options?.migrateFromLocalStorageKeys ?? []) {
      const rawValue = readLocalStorageItem(key);

      if (rawValue === null) {
        continue;
      }

      // Only adopt the legacy value when IndexedDB has no snapshot yet, so we
      // never clobber fresher IndexedDB data with stale localStorage data.
      if (!hasExistingIdbData) {
        const parsedValue = parseJson<ValueType>(rawValue);

        if (isDefined(parsedValue) && isDefined(idbStore)) {
          memoryMap.set(key, parsedValue);
          persist(idbSet(key, parsedValue, idbStore));
        }
      }

      // Always free the localStorage quota once IndexedDB is the source of truth.
      removeLocalStorageItem(key);
    }
  };

  const hydrate = async (): Promise<void> => {
    if (isHydrated) {
      return;
    }

    if (!isDefined(idbStore)) {
      // Fallback path: read the legacy localStorage snapshot into memory so
      // cache-first boot still works where IndexedDB is unavailable.
      for (const key of options?.migrateFromLocalStorageKeys ?? []) {
        const parsedValue = parseJson<ValueType>(readLocalStorageItem(key));

        if (isDefined(parsedValue)) {
          memoryMap.set(key, parsedValue);
        }
      }

      isHydrated = true;
      return;
    }

    let persistedEntries: [string, ValueType][] = [];

    try {
      persistedEntries = await idbEntries<string, ValueType>(idbStore);
    } catch {
      // Corrupted / inaccessible store: fall through to localStorage migration.
    }

    for (const [key, value] of persistedEntries) {
      memoryMap.set(key, value);
    }

    migrateLegacyLocalStorageKeys(persistedEntries.length > 0);

    isHydrated = true;
  };

  const clear = async (): Promise<void> => {
    memoryMap.clear();

    if (isDefined(idbStore)) {
      try {
        await idbClear(idbStore);
      } catch {
        // noop
      }
    }
  };

  return { storage, hydrate, clear };
};

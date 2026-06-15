import {
  clear as idbClear,
  createStore,
  del as idbDelete,
  entries as idbEntries,
  set as idbSet,
  type UseStore,
} from 'idb-keyval';
import { isDefined } from 'twenty-shared/utils';

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
  hydrate: () => Promise<void>;
  clear: () => Promise<void>;
};

const isIndexedDbAvailable = (): boolean => {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null;
  } catch {
    // Accessing indexedDB throws when storage is disabled / sandboxed.
    return false;
  }
};

const removeLocalStorageItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch {
    // noop
  }
};

// Synchronous Jotai storage backed by an in-memory map (so useAtomValue readers
// never suspend), hydrated once from IndexedDB at boot and written through on
// every set. Moves large caches off Safari's ~5MB localStorage cap and keeps
// tabs in sync via a BroadcastChannel.
export const createIndexedDbBackedJotaiStorage = <ValueType>(options?: {
  legacyLocalStorageKeysToClear?: string[];
}): IndexedDbBackedJotaiStorage<ValueType> => {
  const memoryMap = new Map<string, ValueType>();
  const idbStore: UseStore | undefined = isIndexedDbAvailable()
    ? createStore(INDEXED_DB_NAME, INDEXED_DB_STORE_NAME)
    : undefined;
  let isHydrated = false;

  // Persist failures (quota / blocked) are non-fatal: the in-memory map remains
  // the source of truth for the session.
  const persist = (operation: Promise<unknown>): void => {
    void operation.catch(() => {});
  };

  const subscribers = new Map<string, Set<CrossTabSubscriber<ValueType>>>();

  // BroadcastChannel never delivers a tab its own messages, so writes can't loop.
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
      // noop
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
      }
    },
    removeItem: (key) => {
      memoryMap.delete(key);
      broadcast({ type: 'remove', key });

      if (isDefined(idbStore)) {
        persist(idbDelete(key, idbStore));
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

  const hydrate = async (): Promise<void> => {
    if (isHydrated) {
      return;
    }

    if (isDefined(idbStore)) {
      try {
        const persistedEntries = await idbEntries<string, ValueType>(idbStore);

        for (const [key, value] of persistedEntries) {
          memoryMap.set(key, value);
        }
      } catch {
        // noop
      }
    }

    // Free the quota held by the pre-IndexedDB localStorage snapshot. We don't
    // migrate it — atoms re-fetch from the network instead.
    for (const key of options?.legacyLocalStorageKeysToClear ?? []) {
      removeLocalStorageItem(key);
    }

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

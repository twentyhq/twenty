import * as idb from 'idb-keyval';
import { isDefined } from 'twenty-shared/utils';

import { type JotaiSyncStorage } from '@/ui/utilities/state/jotai/types/JotaiSyncStorage';
import { isIndexedDbAvailable } from '@/ui/utilities/state/jotai/utils/isIndexedDbAvailable';
import { logError } from '~/utils/logError';

const INDEXED_DB_STORE_NAME = 'keyval';

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

const createIndexedDbStore = (cacheName: string): idb.UseStore | undefined => {
  if (!isIndexedDbAvailable()) {
    return undefined;
  }

  return idb.createStore(`twenty-front-${cacheName}`, INDEXED_DB_STORE_NAME);
};

const createCrossTabChannel = (cacheName: string): BroadcastChannel | null => {
  if (typeof BroadcastChannel === 'undefined') {
    return null;
  }

  try {
    return new BroadcastChannel(`twenty-front-${cacheName}-sync`);
  } catch (error) {
    logError(error);
    return null;
  }
};

export const createIndexedDbBackedJotaiStorage = <ValueType>(
  cacheName: string,
): IndexedDbBackedJotaiStorage<ValueType> => {
  const memoryMap = new Map<string, ValueType>();
  const idbStore = createIndexedDbStore(cacheName);
  const broadcastChannel = createCrossTabChannel(cacheName);
  const subscribers = new Map<string, Set<CrossTabSubscriber<ValueType>>>();
  let isHydrated = false;

  const persist = (operation: Promise<unknown>): void => {
    void operation.catch(logError);
  };

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
    } catch (error) {
      logError(error);
    }
  };

  const storage: JotaiSyncStorage<ValueType> = {
    getItem: (key, initialValue) =>
      memoryMap.has(key) ? (memoryMap.get(key) as ValueType) : initialValue,
    setItem: (key, newValue) => {
      memoryMap.set(key, newValue);
      broadcast({ type: 'set', key, value: newValue });

      if (isDefined(idbStore)) {
        persist(idb.set(key, newValue, idbStore));
      }
    },
    removeItem: (key) => {
      memoryMap.delete(key);
      broadcast({ type: 'remove', key });

      if (isDefined(idbStore)) {
        persist(idb.del(key, idbStore));
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
    if (isHydrated || !isDefined(idbStore)) {
      isHydrated = true;
      return;
    }

    try {
      const persistedEntries = await idb.entries<string, ValueType>(idbStore);

      for (const [key, value] of persistedEntries) {
        memoryMap.set(key, value);
      }
    } catch (error) {
      logError(error);
    }

    isHydrated = true;
  };

  const clear = async (): Promise<void> => {
    memoryMap.clear();

    if (!isDefined(idbStore)) {
      return;
    }

    try {
      await idb.clear(idbStore);
    } catch (error) {
      logError(error);
    }
  };

  return { storage, hydrate, clear };
};

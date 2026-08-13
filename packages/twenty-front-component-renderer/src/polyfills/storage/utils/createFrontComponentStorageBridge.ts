import { isDefined } from 'twenty-shared/utils';
import { type FrontComponentStorageType } from 'twenty-sdk/front-component';

import { STORAGE_PERSISTENCE_FAILURE_WARNING } from '@/polyfills/storage/constants/StoragePersistenceFailureWarning';
import { type FrontComponentStorageBridge } from '@/polyfills/storage/types/FrontComponentStorageBridge';
import { type FrontComponentHostCommunicationApiStore } from '@/types/FrontComponentHostCommunicationApiStore';
import { getFrontComponentStorageViolationMessage } from '@/utils/getFrontComponentStorageViolationMessage';

export const createFrontComponentStorageBridge = ({
  storageType,
}: {
  storageType: FrontComponentStorageType;
}): FrontComponentStorageBridge => {
  const entries = new Map<string, string>();
  const pendingPersistOperations: (() => void)[] = [];

  let hostCommunicationApi: FrontComponentHostCommunicationApiStore | null =
    null;
  let cachedKeys: string[] | null = null;

  const getKeys = (): string[] => {
    cachedKeys ??= Array.from(entries.keys());

    return cachedKeys;
  };

  const runPersist = (
    persistOperation: (
      connectedHostCommunicationApi: FrontComponentHostCommunicationApiStore,
    ) => Promise<void> | undefined,
  ): void => {
    if (!isDefined(hostCommunicationApi)) {
      return;
    }

    persistOperation(hostCommunicationApi)?.catch(() => {
      console.warn(STORAGE_PERSISTENCE_FAILURE_WARNING);
    });
  };

  const persist = (
    persistOperation: (
      connectedHostCommunicationApi: FrontComponentHostCommunicationApiStore,
    ) => Promise<void> | undefined,
  ): void => {
    if (isDefined(hostCommunicationApi)) {
      runPersist(persistOperation);

      return;
    }

    pendingPersistOperations.push(() => runPersist(persistOperation));
  };

  const getOtherEntriesTotalLength = (excludedKey: string): number => {
    let totalLength = 0;

    for (const [key, value] of entries) {
      if (key !== excludedKey) {
        totalLength += key.length + value.length;
      }
    }

    return totalLength;
  };

  return {
    getItem: (key) => entries.get(key) ?? null,
    getKeyAtIndex: (index) => getKeys()[index] ?? null,
    getLength: () => entries.size,

    seed: (seededEntries) => {
      entries.clear();
      cachedKeys = null;

      for (const [key, value] of Object.entries(seededEntries)) {
        entries.set(key, value);
      }
    },

    setItem: (key, serializedValue) => {
      const violationMessage = getFrontComponentStorageViolationMessage({
        key,
        serializedValue,
        otherEntriesTotalLength: getOtherEntriesTotalLength(key),
      });

      if (isDefined(violationMessage)) {
        throw new DOMException(violationMessage, 'QuotaExceededError');
      }

      entries.set(key, serializedValue);
      cachedKeys = null;

      persist((connectedHostCommunicationApi) =>
        connectedHostCommunicationApi.storageSet?.({
          storageType,
          key,
          serializedValue,
        }),
      );
    },

    removeItem: (key) => {
      entries.delete(key);
      cachedKeys = null;

      persist((connectedHostCommunicationApi) =>
        connectedHostCommunicationApi.storageDelete?.({ storageType, key }),
      );
    },

    clear: () => {
      entries.clear();
      cachedKeys = null;

      persist((connectedHostCommunicationApi) =>
        connectedHostCommunicationApi.storageClear?.({ storageType }),
      );
    },

    connectHostCommunicationApi: (nextHostCommunicationApi) => {
      hostCommunicationApi = nextHostCommunicationApi;

      for (const operation of pendingPersistOperations.splice(0)) {
        operation();
      }
    },
  };
};

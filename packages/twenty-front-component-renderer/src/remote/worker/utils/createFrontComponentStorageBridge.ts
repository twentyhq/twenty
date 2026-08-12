import { isDefined } from 'twenty-shared/utils';
import { type FrontComponentStorageType } from 'twenty-sdk/front-component';

import { type FrontComponentHostCommunicationApiStore } from '@/types/FrontComponentHostCommunicationApiStore';
import { type FrontComponentStorageBridge } from '@/types/FrontComponentStorageBridge';
import { getFrontComponentStorageViolationMessage } from '@/utils/getFrontComponentStorageViolationMessage';

const STORAGE_PERSISTENCE_FAILURE_WARNING =
  'A front component storage write could not be persisted';

export const createFrontComponentStorageBridge = ({
  storageType,
  getHostCommunicationApi,
}: {
  storageType: FrontComponentStorageType;
  getHostCommunicationApi: () => FrontComponentHostCommunicationApiStore;
}): FrontComponentStorageBridge => {
  const entries = new Map<string, string>();
  const pendingPersistOperations: (() => void)[] = [];

  let cachedKeys: string[] | null = null;

  const getKeys = (): string[] => {
    cachedKeys ??= Array.from(entries.keys());

    return cachedKeys;
  };

  const persist = (
    runPersist: (
      hostCommunicationApi: FrontComponentHostCommunicationApiStore,
    ) => Promise<void> | undefined,
  ): void => {
    const executePersist = (): Promise<void> | undefined =>
      runPersist(getHostCommunicationApi())?.catch(() => {
        console.warn(STORAGE_PERSISTENCE_FAILURE_WARNING);
      });

    const persistResult = executePersist();

    if (!isDefined(persistResult)) {
      pendingPersistOperations.push(executePersist);
    }
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

      persist((hostCommunicationApi) =>
        hostCommunicationApi.storageSet?.({
          storageType,
          key,
          serializedValue,
        }),
      );
    },

    removeItem: (key) => {
      entries.delete(key);
      cachedKeys = null;

      persist((hostCommunicationApi) =>
        hostCommunicationApi.storageDelete?.({ storageType, key }),
      );
    },

    clear: () => {
      entries.clear();
      cachedKeys = null;

      persist((hostCommunicationApi) =>
        hostCommunicationApi.storageClear?.({ storageType }),
      );
    },

    flushPendingPersistOperations: () => {
      const operationsToFlush = pendingPersistOperations.splice(0);

      for (const operation of operationsToFlush) {
        operation();
      }
    },
  };
};

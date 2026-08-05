import { createFrontComponentLocalStorageCache } from '@/remote/worker/utils/createFrontComponentLocalStorageCache';
import { createFrontComponentLocalStoragePersistQueue } from '@/remote/worker/utils/createFrontComponentLocalStoragePersistQueue';
import { toQuotaExceededDomException } from '@/remote/worker/utils/toQuotaExceededDomException';
import { type FrontComponentHostCommunicationApiStore } from '@/types/FrontComponentHostCommunicationApiStore';
import { type FrontComponentLocalStorageWorkerBridge } from '@/types/FrontComponentLocalStorageWorkerBridge';
import { assertNoFrontComponentLocalStorageViolation } from '@/utils/assertNoFrontComponentLocalStorageViolation';

const LOCAL_STORAGE_PERSISTENCE_FAILURE_WARNING =
  'A front component local storage write could not be persisted';

export const createFrontComponentLocalStorageBridge = ({
  getHostCommunicationApi,
}: {
  getHostCommunicationApi: () => FrontComponentHostCommunicationApiStore;
}): FrontComponentLocalStorageWorkerBridge => {
  const cache = createFrontComponentLocalStorageCache();
  const persistQueue = createFrontComponentLocalStoragePersistQueue({
    getHostCommunicationApi,
  });

  const assertCanStore = (key: string, serializedValue: string): void => {
    assertNoFrontComponentLocalStorageViolation({
      key,
      serializedValue,
      otherEntriesTotalLength: cache.getOtherEntriesTotalLength(key),
    });
  };

  const persistInBackground = (persistOperation: Promise<unknown>): void => {
    persistOperation.catch(() => {
      console.warn(LOCAL_STORAGE_PERSISTENCE_FAILURE_WARNING);
    });
  };

  const setItemAndPersist = async (
    key: string,
    serializedValue: string,
  ): Promise<void> => {
    assertCanStore(key, serializedValue);

    const mutation = cache.beginWrite(key, serializedValue);

    try {
      await persistQueue.schedule((hostCommunicationApi) =>
        hostCommunicationApi.localStorageSet?.(key, serializedValue),
      );
    } catch (error) {
      mutation.rollback();

      throw error;
    }

    mutation.commit();
  };

  const removeItemAndPersist = async (key: string): Promise<boolean> => {
    const mutation = cache.beginDelete(key);

    try {
      await persistQueue.schedule((hostCommunicationApi) =>
        hostCommunicationApi.localStorageDelete?.(key),
      );
    } catch (error) {
      mutation.rollback();

      throw error;
    }

    mutation.commit();

    return mutation.wasPresent;
  };

  const clearAndPersist = async (): Promise<void> => {
    const mutation = cache.beginClear();

    try {
      await persistQueue.schedule((hostCommunicationApi) =>
        hostCommunicationApi.localStorageClear?.(),
      );
    } catch (error) {
      mutation.rollback();

      throw error;
    }

    mutation.commit();
  };

  return {
    getItem: cache.getItem,
    getKeys: cache.getKeys,
    getKeyAtIndex: cache.getKeyAtIndex,
    getLength: cache.getLength,
    seed: cache.seed,
    setItemAndPersist,
    removeItemAndPersist,
    clearAndPersist,

    setItem: (key, serializedValue) => {
      try {
        assertCanStore(key, serializedValue);
      } catch (error) {
        throw toQuotaExceededDomException(error);
      }

      persistInBackground(setItemAndPersist(key, serializedValue));
    },

    removeItem: (key) => {
      persistInBackground(removeItemAndPersist(key));
    },

    clear: () => {
      persistInBackground(clearAndPersist());
    },

    flushPendingPersistOperations: persistQueue.flush,
  };
};

import { isDefined } from 'twenty-shared/utils';

import { type FrontComponentHostCommunicationApiStore } from '@/types/FrontComponentHostCommunicationApiStore';
import { type FrontComponentLocalStorageWorkerBridge } from '@/types/FrontComponentLocalStorageWorkerBridge';
import { FrontComponentStorageError } from '@/utils/FrontComponentStorageError';
import { getFrontComponentLocalStorageViolation } from '@/utils/getFrontComponentLocalStorageViolation';
import { getFrontComponentLocalStorageViolationMessage } from '@/utils/getFrontComponentLocalStorageViolationMessage';

const LOCAL_STORAGE_PERSISTENCE_FAILURE_WARNING =
  'A front component local storage write could not be persisted';

const toQuotaExceededDomException = (error: unknown): unknown =>
  error instanceof FrontComponentStorageError
    ? new DOMException(error.message, 'QuotaExceededError')
    : error;

export const createFrontComponentLocalStorageBridge = ({
  getHostCommunicationApi,
}: {
  getHostCommunicationApi: () => FrontComponentHostCommunicationApiStore;
}): FrontComponentLocalStorageWorkerBridge => {
  const entries = new Map<string, string>();
  const pendingPersistOperations: (() => void)[] = [];
  const inFlightMutationIdByKey = new Map<string, number>();

  let lastMutationId = 0;

  const getOtherEntriesTotalLength = (excludedKey: string): number => {
    let totalLength = 0;

    for (const [key, value] of entries) {
      if (key !== excludedKey) {
        totalLength += value.length;
      }
    }

    return totalLength;
  };

  const assertCanStore = (key: string, serializedValue: string): void => {
    const violation = getFrontComponentLocalStorageViolation({
      key,
      serializedValue,
      otherEntriesTotalLength: getOtherEntriesTotalLength(key),
    });

    if (isDefined(violation)) {
      throw new FrontComponentStorageError(
        getFrontComponentLocalStorageViolationMessage(violation),
        violation,
      );
    }
  };

  const startMutation = (key: string): number => {
    lastMutationId += 1;
    inFlightMutationIdByKey.set(key, lastMutationId);

    return lastMutationId;
  };

  const endMutation = (key: string, mutationId: number): boolean => {
    const isLatestMutation = inFlightMutationIdByKey.get(key) === mutationId;

    if (isLatestMutation) {
      inFlightMutationIdByKey.delete(key);
    }

    return isLatestMutation;
  };

  const restoreEntry = (
    key: string,
    previousValue: string | undefined,
  ): void => {
    if (isDefined(previousValue)) {
      entries.set(key, previousValue);

      return;
    }

    entries.delete(key);
  };

  const schedulePersist = <TResult>(
    runPersist: (
      hostCommunicationApi: FrontComponentHostCommunicationApiStore,
    ) => Promise<TResult> | undefined,
  ): Promise<TResult> =>
    new Promise<TResult>((resolve, reject) => {
      const executePersist = () => {
        const persistResult = runPersist(getHostCommunicationApi());

        if (!isDefined(persistResult)) {
          reject(
            new FrontComponentStorageError(
              'Device storage is unavailable',
              'FRONT_COMPONENT_STORAGE_UNAVAILABLE',
            ),
          );

          return;
        }

        persistResult.then(resolve, reject);
      };

      if (isDefined(getHostCommunicationApi().localStorageSet)) {
        executePersist();

        return;
      }

      pendingPersistOperations.push(executePersist);
    });

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

    const previousValue = entries.get(key);

    entries.set(key, serializedValue);

    const mutationId = startMutation(key);

    try {
      await schedulePersist((hostCommunicationApi) =>
        hostCommunicationApi.localStorageSet?.(key, serializedValue),
      );
    } catch (error) {
      if (endMutation(key, mutationId)) {
        restoreEntry(key, previousValue);
      }

      throw error;
    }

    endMutation(key, mutationId);
  };

  const removeItemAndPersist = async (key: string): Promise<boolean> => {
    const previousValue = entries.get(key);
    const wasPresent = entries.delete(key);
    const mutationId = startMutation(key);

    try {
      await schedulePersist((hostCommunicationApi) =>
        hostCommunicationApi.localStorageDelete?.(key),
      );
    } catch (error) {
      if (endMutation(key, mutationId)) {
        restoreEntry(key, previousValue);
      }

      throw error;
    }

    endMutation(key, mutationId);

    return wasPresent;
  };

  const clearAndPersist = async (): Promise<void> => {
    const previousEntries = new Map(entries);
    const mutationIdByKey = new Map<string, number>();

    for (const key of previousEntries.keys()) {
      mutationIdByKey.set(key, startMutation(key));
    }

    entries.clear();

    try {
      await schedulePersist((hostCommunicationApi) =>
        hostCommunicationApi.localStorageClear?.(),
      );
    } catch (error) {
      for (const [key, mutationId] of mutationIdByKey) {
        if (endMutation(key, mutationId)) {
          restoreEntry(key, previousEntries.get(key));
        }
      }

      throw error;
    }

    for (const [key, mutationId] of mutationIdByKey) {
      endMutation(key, mutationId);
    }
  };

  return {
    getItem: (key) => entries.get(key) ?? null,
    getKeys: () => Array.from(entries.keys()),
    getKeyAtIndex: (index) => Array.from(entries.keys())[index] ?? null,
    getLength: () => entries.size,
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

    seed: (seededEntries) => {
      entries.clear();

      for (const [key, value] of Object.entries(seededEntries)) {
        entries.set(key, value);
      }
    },

    flushPendingPersistOperations: () => {
      const operationsToFlush = pendingPersistOperations.splice(0);

      for (const operation of operationsToFlush) {
        operation();
      }
    },
  };
};

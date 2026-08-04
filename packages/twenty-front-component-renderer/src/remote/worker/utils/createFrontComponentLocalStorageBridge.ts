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
  const committedEntries = new Map<string, string>();
  const pendingMutationCountByKey = new Map<string, number>();
  const pendingPersistOperations: (() => void)[] = [];

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

  const startKeyMutations = (keys: string[]): void => {
    for (const key of keys) {
      pendingMutationCountByKey.set(
        key,
        (pendingMutationCountByKey.get(key) ?? 0) + 1,
      );
    }
  };

  const endKeyMutations = (keys: string[]): void => {
    for (const key of keys) {
      const remainingCount = (pendingMutationCountByKey.get(key) ?? 1) - 1;

      if (remainingCount <= 0) {
        pendingMutationCountByKey.delete(key);

        continue;
      }

      pendingMutationCountByKey.set(key, remainingCount);
    }
  };

  const revertSettledKeysToCommitted = (keys: string[]): void => {
    for (const key of keys) {
      if (pendingMutationCountByKey.has(key)) {
        continue;
      }

      const committedValue = committedEntries.get(key);

      if (isDefined(committedValue)) {
        entries.set(key, committedValue);

        continue;
      }

      entries.delete(key);
    }
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

    entries.set(key, serializedValue);
    startKeyMutations([key]);

    try {
      await schedulePersist((hostCommunicationApi) =>
        hostCommunicationApi.localStorageSet?.(key, serializedValue),
      );
    } catch (error) {
      endKeyMutations([key]);
      revertSettledKeysToCommitted([key]);

      throw error;
    }

    committedEntries.set(key, serializedValue);
    endKeyMutations([key]);
  };

  const removeItemAndPersist = async (key: string): Promise<boolean> => {
    const wasPresent = entries.delete(key);
    startKeyMutations([key]);

    try {
      await schedulePersist((hostCommunicationApi) =>
        hostCommunicationApi.localStorageDelete?.(key),
      );
    } catch (error) {
      endKeyMutations([key]);
      revertSettledKeysToCommitted([key]);

      throw error;
    }

    committedEntries.delete(key);
    endKeyMutations([key]);

    return wasPresent;
  };

  const clearAndPersist = async (): Promise<void> => {
    const affectedKeys = Array.from(
      new Set([...entries.keys(), ...committedEntries.keys()]),
    );

    entries.clear();
    startKeyMutations(affectedKeys);

    try {
      await schedulePersist((hostCommunicationApi) =>
        hostCommunicationApi.localStorageClear?.(),
      );
    } catch (error) {
      endKeyMutations(affectedKeys);
      revertSettledKeysToCommitted(affectedKeys);

      throw error;
    }

    committedEntries.clear();
    endKeyMutations(affectedKeys);
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
      committedEntries.clear();

      for (const [key, value] of Object.entries(seededEntries)) {
        entries.set(key, value);
        committedEntries.set(key, value);
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

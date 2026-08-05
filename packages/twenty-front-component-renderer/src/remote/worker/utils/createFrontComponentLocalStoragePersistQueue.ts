import { isDefined } from 'twenty-shared/utils';

import { type FrontComponentHostCommunicationApiStore } from '@/types/FrontComponentHostCommunicationApiStore';
import { type FrontComponentLocalStoragePersistQueue } from '@/types/FrontComponentLocalStoragePersistQueue';
import { FrontComponentStorageError } from '@/utils/FrontComponentStorageError';

export const createFrontComponentLocalStoragePersistQueue = ({
  getHostCommunicationApi,
}: {
  getHostCommunicationApi: () => FrontComponentHostCommunicationApiStore;
}): FrontComponentLocalStoragePersistQueue => {
  const pendingPersistOperations: (() => void)[] = [];

  return {
    schedule: <TResult>(
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
      }),

    flush: () => {
      const operationsToFlush = pendingPersistOperations.splice(0);

      for (const operation of operationsToFlush) {
        operation();
      }
    },
  };
};

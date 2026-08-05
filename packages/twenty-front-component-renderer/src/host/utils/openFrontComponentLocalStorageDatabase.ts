import { isDefined } from 'twenty-shared/utils';

import { FRONT_COMPONENT_LOCAL_STORAGE_DATABASE_NAME } from '@/host/constants/FrontComponentLocalStorageDatabaseName';
import { FRONT_COMPONENT_LOCAL_STORAGE_DATABASE_VERSION } from '@/host/constants/FrontComponentLocalStorageDatabaseVersion';
import { FRONT_COMPONENT_LOCAL_STORAGE_ENTRIES_STORE_NAME } from '@/host/constants/FrontComponentLocalStorageEntriesStoreName';
import { toFrontComponentStorageError } from '@/host/utils/toFrontComponentStorageError';
import { FrontComponentStorageError } from '@/utils/FrontComponentStorageError';

let databasePromise: Promise<IDBDatabase> | null = null;

export const openFrontComponentLocalStorageDatabase =
  (): Promise<IDBDatabase> => {
    if (isDefined(databasePromise)) {
      return databasePromise;
    }

    databasePromise = new Promise<IDBDatabase>((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(
          new FrontComponentStorageError(
            'IndexedDB is unavailable in this browser context',
            'FRONT_COMPONENT_STORAGE_UNAVAILABLE',
          ),
        );

        return;
      }

      const openRequest = indexedDB.open(
        FRONT_COMPONENT_LOCAL_STORAGE_DATABASE_NAME,
        FRONT_COMPONENT_LOCAL_STORAGE_DATABASE_VERSION,
      );

      openRequest.onupgradeneeded = () => {
        const database = openRequest.result;

        if (
          !database.objectStoreNames.contains(
            FRONT_COMPONENT_LOCAL_STORAGE_ENTRIES_STORE_NAME,
          )
        ) {
          database.createObjectStore(
            FRONT_COMPONENT_LOCAL_STORAGE_ENTRIES_STORE_NAME,
            { keyPath: ['namespace', 'key'] },
          );
        }
      };

      let isOpenRequestSettled = false;

      openRequest.onblocked = () => {
        isOpenRequestSettled = true;

        reject(
          new FrontComponentStorageError(
            'The device storage database upgrade is blocked by another tab',
            'FRONT_COMPONENT_STORAGE_UNAVAILABLE',
          ),
        );
      };

      openRequest.onerror = () => {
        isOpenRequestSettled = true;

        reject(openRequest.error);
      };

      openRequest.onsuccess = () => {
        const database = openRequest.result;

        if (isOpenRequestSettled) {
          database.close();

          return;
        }

        database.onversionchange = () => {
          database.close();
          databasePromise = null;
        };

        database.onclose = () => {
          databasePromise = null;
        };

        resolve(database);
      };
    }).catch((error) => {
      databasePromise = null;

      throw toFrontComponentStorageError(error);
    });

    return databasePromise;
  };

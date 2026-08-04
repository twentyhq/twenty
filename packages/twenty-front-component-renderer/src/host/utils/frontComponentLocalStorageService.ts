import { isDefined } from 'twenty-shared/utils';

import { type FrontComponentLocalStorageNamespace } from '@/types/FrontComponentLocalStorageNamespace';
import { FrontComponentStorageError } from '@/utils/FrontComponentStorageError';
import { getFrontComponentLocalStorageViolation } from '@/utils/getFrontComponentLocalStorageViolation';
import { getFrontComponentLocalStorageViolationMessage } from '@/utils/getFrontComponentLocalStorageViolationMessage';

const FRONT_COMPONENT_LOCAL_STORAGE_DATABASE_NAME =
  'front-component-local-storage';
const FRONT_COMPONENT_LOCAL_STORAGE_DATABASE_VERSION = 1;
const FRONT_COMPONENT_LOCAL_STORAGE_ENTRIES_STORE_NAME = 'entries';

type FrontComponentLocalStorageEntry = {
  namespace: string;
  key: string;
  value: string;
  size: number;
  updatedAt: number;
};

let databasePromise: Promise<IDBDatabase> | null = null;

const buildNamespace = ({
  applicationId,
  userId,
}: FrontComponentLocalStorageNamespace): string => `${applicationId}:${userId}`;

const buildNamespaceRange = (namespace: string): IDBKeyRange =>
  IDBKeyRange.bound([namespace], [namespace, []]);

const promisifyRequest = <TResult>(
  request: IDBRequest<TResult>,
): Promise<TResult> =>
  new Promise<TResult>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const toFrontComponentStorageError = (
  error: unknown,
): FrontComponentStorageError => {
  if (error instanceof FrontComponentStorageError) {
    return error;
  }

  if (error instanceof DOMException && error.name === 'QuotaExceededError') {
    return new FrontComponentStorageError(
      'The browser storage quota is exhausted',
      'FRONT_COMPONENT_STORAGE_QUOTA_EXCEEDED',
    );
  }

  return new FrontComponentStorageError(
    'Device storage is unavailable',
    'FRONT_COMPONENT_STORAGE_UNAVAILABLE',
  );
};

const openDatabase = (): Promise<IDBDatabase> => {
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

const openEntriesStore = async (
  mode: IDBTransactionMode,
): Promise<{ store: IDBObjectStore; transaction: IDBTransaction }> => {
  const database = await openDatabase();
  const transaction = database.transaction(
    FRONT_COMPONENT_LOCAL_STORAGE_ENTRIES_STORE_NAME,
    mode,
  );

  return {
    store: transaction.objectStore(
      FRONT_COMPONENT_LOCAL_STORAGE_ENTRIES_STORE_NAME,
    ),
    transaction,
  };
};

const watchTransactionCompletion = (
  transaction: IDBTransaction,
): Promise<void> => {
  const completion = new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () =>
      reject(
        transaction.error ??
          new FrontComponentStorageError(
            'The device storage transaction was aborted',
            'FRONT_COMPONENT_STORAGE_UNAVAILABLE',
          ),
      );
  });

  completion.catch(() => undefined);

  return completion;
};

export const frontComponentLocalStorageService = {
  snapshot: async (
    input: FrontComponentLocalStorageNamespace,
  ): Promise<Record<string, string>> => {
    try {
      const { store } = await openEntriesStore('readonly');

      const entries = await promisifyRequest<FrontComponentLocalStorageEntry[]>(
        store.getAll(buildNamespaceRange(buildNamespace(input))),
      );

      return Object.fromEntries(entries.map(({ key, value }) => [key, value]));
    } catch (error) {
      throw toFrontComponentStorageError(error);
    }
  },

  set: async ({
    key,
    serializedValue,
    ...namespaceInput
  }: FrontComponentLocalStorageNamespace & {
    key: string;
    serializedValue: string;
  }): Promise<void> => {
    const namespace = buildNamespace(namespaceInput);

    try {
      const { store, transaction } = await openEntriesStore('readwrite');
      const transactionCompletion = watchTransactionCompletion(transaction);

      const entries = await promisifyRequest<FrontComponentLocalStorageEntry[]>(
        store.getAll(buildNamespaceRange(namespace)),
      );

      const otherEntriesTotalLength = entries
        .filter((entry) => entry.key !== key)
        .reduce((total, entry) => total + entry.size, 0);

      const violation = getFrontComponentLocalStorageViolation({
        key,
        serializedValue,
        otherEntriesTotalLength,
      });

      if (isDefined(violation)) {
        transaction.abort();

        throw new FrontComponentStorageError(
          getFrontComponentLocalStorageViolationMessage(violation),
          violation,
        );
      }

      const entry: FrontComponentLocalStorageEntry = {
        namespace,
        key,
        value: serializedValue,
        size: serializedValue.length,
        updatedAt: Date.now(),
      };

      store.put(entry);

      await transactionCompletion;
    } catch (error) {
      throw toFrontComponentStorageError(error);
    }
  },

  delete: async ({
    key,
    ...namespaceInput
  }: FrontComponentLocalStorageNamespace & {
    key: string;
  }): Promise<boolean> => {
    const namespace = buildNamespace(namespaceInput);

    try {
      const { store, transaction } = await openEntriesStore('readwrite');
      const transactionCompletion = watchTransactionCompletion(transaction);

      const existingEntry = await promisifyRequest<
        FrontComponentLocalStorageEntry | undefined
      >(store.get([namespace, key]));

      if (isDefined(existingEntry)) {
        store.delete([namespace, key]);
      }

      await transactionCompletion;

      return isDefined(existingEntry);
    } catch (error) {
      throw toFrontComponentStorageError(error);
    }
  },

  clear: async (input: FrontComponentLocalStorageNamespace): Promise<void> => {
    try {
      const { store, transaction } = await openEntriesStore('readwrite');
      const transactionCompletion = watchTransactionCompletion(transaction);

      store.delete(buildNamespaceRange(buildNamespace(input)));

      await transactionCompletion;
    } catch (error) {
      throw toFrontComponentStorageError(error);
    }
  },
};

// Minimal dependency-free IndexedDB key-value store used to back the metadata
// cache. We persist the metadata store here instead of localStorage because
// Safari caps localStorage at ~5MB per origin (counted in UTF-16, so ~2.5M
// chars), which large workspaces blow past. IndexedDB uses a much larger
// disk-based quota.

const DB_NAME = 'twenty-front-cache';
const STORE_NAME = 'keyval';
const DB_VERSION = 1;

let databasePromise: Promise<IDBDatabase> | null = null;

export const isIndexedDbAvailable = (): boolean => {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null;
  } catch {
    // Accessing indexedDB can throw in sandboxed iframes / disabled storage.
    return false;
  }
};

const openDatabase = (): Promise<IDBDatabase> => {
  if (databasePromise !== null) {
    return databasePromise;
  }

  databasePromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return databasePromise;
};

const runInStore = async <ResultType>(
  mode: IDBTransactionMode,
  executor: (store: IDBObjectStore) => IDBRequest | void,
): Promise<ResultType | undefined> => {
  const database = await openDatabase();

  return new Promise<ResultType | undefined>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    const request = executor(store);

    transaction.oncomplete = () =>
      resolve((request as IDBRequest<ResultType>)?.result);
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
};

export const idbGetAllEntries = async (): Promise<[string, unknown][]> => {
  if (!isIndexedDbAvailable()) {
    return [];
  }

  try {
    const database = await openDatabase();

    return await new Promise<[string, unknown][]>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const keysRequest = store.getAllKeys();
      const valuesRequest = store.getAll();

      transaction.oncomplete = () => {
        const keys = keysRequest.result as IDBValidKey[];
        const values = valuesRequest.result as unknown[];

        resolve(keys.map((key, index) => [String(key), values[index]]));
      };
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } catch {
    return [];
  }
};

export const idbSet = async (key: string, value: unknown): Promise<void> => {
  if (!isIndexedDbAvailable()) {
    return;
  }

  try {
    await runInStore('readwrite', (store) => store.put(value, key));
  } catch {
    // Swallow write failures (quota / private mode); the in-memory cache keeps
    // the app working for the current session.
  }
};

export const idbDelete = async (key: string): Promise<void> => {
  if (!isIndexedDbAvailable()) {
    return;
  }

  try {
    await runInStore('readwrite', (store) => store.delete(key));
  } catch {
    // noop
  }
};

export const idbClear = async (): Promise<void> => {
  if (!isIndexedDbAvailable()) {
    return;
  }

  try {
    await runInStore('readwrite', (store) => store.clear());
  } catch {
    // noop
  }
};

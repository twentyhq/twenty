import { FRONT_COMPONENT_LOCAL_STORAGE_ENTRIES_STORE_NAME } from '@/host/constants/FrontComponentLocalStorageEntriesStoreName';
import { openFrontComponentLocalStorageDatabase } from '@/host/utils/openFrontComponentLocalStorageDatabase';

export const openFrontComponentLocalStorageEntriesStore = async (
  mode: IDBTransactionMode,
): Promise<{ store: IDBObjectStore; transaction: IDBTransaction }> => {
  const database = await openFrontComponentLocalStorageDatabase();
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

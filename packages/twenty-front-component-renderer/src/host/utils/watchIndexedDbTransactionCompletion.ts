import { FrontComponentStorageError } from '@/utils/FrontComponentStorageError';

export const watchIndexedDbTransactionCompletion = (
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

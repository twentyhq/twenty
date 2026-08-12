import { getNamespacedStorageKeys } from '@/host/utils/getNamespacedStorageKeys';
import { type FrontComponentStorageScope } from '@/types/FrontComponentStorageScope';

export const snapshotFrontComponentStorage = ({
  namespace,
  storageType,
}: FrontComponentStorageScope): Record<string, string> => {
  const storage = window[storageType];

  return Object.fromEntries(
    getNamespacedStorageKeys({ storage, namespace }).map((namespacedKey) => [
      namespacedKey.slice(namespace.length),
      storage.getItem(namespacedKey) ?? '',
    ]),
  );
};

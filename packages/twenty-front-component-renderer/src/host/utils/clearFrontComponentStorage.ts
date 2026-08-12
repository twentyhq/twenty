import { buildFrontComponentStorageNamespacePrefix } from '@/host/utils/buildFrontComponentStorageNamespacePrefix';
import { getNamespacedStorageKeys } from '@/host/utils/getNamespacedStorageKeys';
import { type FrontComponentStorageScope } from '@/types/FrontComponentStorageScope';

export const clearFrontComponentStorage = ({
  storageType,
  ...namespace
}: FrontComponentStorageScope): void => {
  const storage = window[storageType];

  for (const namespacedKey of getNamespacedStorageKeys({
    storage,
    namespacePrefix: buildFrontComponentStorageNamespacePrefix(namespace),
  })) {
    storage.removeItem(namespacedKey);
  }
};

import { buildFrontComponentStorageNamespacePrefix } from '@/host/utils/buildFrontComponentStorageNamespacePrefix';
import { getNamespacedStorageKeys } from '@/host/utils/getNamespacedStorageKeys';
import { type FrontComponentStorageScope } from '@/types/FrontComponentStorageScope';

export const snapshotFrontComponentStorage = ({
  storageType,
  ...namespace
}: FrontComponentStorageScope): Record<string, string> => {
  const storage = window[storageType];
  const namespacePrefix = buildFrontComponentStorageNamespacePrefix(namespace);

  return Object.fromEntries(
    getNamespacedStorageKeys({ storage, namespacePrefix }).map(
      (namespacedKey) => [
        namespacedKey.slice(namespacePrefix.length),
        storage.getItem(namespacedKey) ?? '',
      ],
    ),
  );
};

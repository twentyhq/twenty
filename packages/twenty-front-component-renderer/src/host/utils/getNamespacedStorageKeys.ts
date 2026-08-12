import { isDefined } from 'twenty-shared/utils';

export const getNamespacedStorageKeys = ({
  storage,
  namespacePrefix,
}: {
  storage: Storage;
  namespacePrefix: string;
}): string[] => {
  const namespacedKeys: string[] = [];

  for (let index = 0; index < storage.length; index++) {
    const storageKey = storage.key(index);

    if (isDefined(storageKey) && storageKey.startsWith(namespacePrefix)) {
      namespacedKeys.push(storageKey);
    }
  }

  return namespacedKeys;
};

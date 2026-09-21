import { isDefined } from 'twenty-shared/utils';

export const getNamespacedStorageKeys = ({
  storage,
  namespace,
}: {
  storage: Storage;
  namespace: string;
}): string[] => {
  const namespacedKeys: string[] = [];

  for (let index = 0; index < storage.length; index++) {
    const storageKey = storage.key(index);

    if (isDefined(storageKey) && storageKey.startsWith(namespace)) {
      namespacedKeys.push(storageKey);
    }
  }

  return namespacedKeys;
};

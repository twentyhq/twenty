import { isDefined } from 'twenty-shared/utils';

export const getBrowserStorageKeysWithPrefix = (
  browserStorage: Storage,
  keyPrefix: string,
): string[] => {
  const prefixedKeys: string[] = [];

  for (let index = 0; index < browserStorage.length; index++) {
    const storageKey = browserStorage.key(index);

    if (isDefined(storageKey) && storageKey.startsWith(keyPrefix)) {
      prefixedKeys.push(storageKey);
    }
  }

  return prefixedKeys;
};

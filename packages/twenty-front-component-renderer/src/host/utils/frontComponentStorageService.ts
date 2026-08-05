import { isDefined } from 'twenty-shared/utils';
import { type FrontComponentStorageArea } from 'twenty-sdk/front-component';

import { buildFrontComponentStorageKeyPrefix } from '@/host/utils/buildFrontComponentStorageKeyPrefix';
import { type FrontComponentStorageNamespace } from '@/types/FrontComponentStorageNamespace';
import { getFrontComponentStorageViolationMessage } from '@/utils/getFrontComponentStorageViolationMessage';

type FrontComponentStorageAreaInput = FrontComponentStorageNamespace & {
  area: FrontComponentStorageArea;
};

const getBrowserStorage = (area: FrontComponentStorageArea): Storage =>
  area === 'local' ? window.localStorage : window.sessionStorage;

const getNamespacedKeys = (
  browserStorage: Storage,
  keyPrefix: string,
): string[] => {
  const namespacedKeys: string[] = [];

  for (let index = 0; index < browserStorage.length; index++) {
    const namespacedKey = browserStorage.key(index);

    if (isDefined(namespacedKey) && namespacedKey.startsWith(keyPrefix)) {
      namespacedKeys.push(namespacedKey);
    }
  }

  return namespacedKeys;
};

export const frontComponentStorageService = {
  snapshot: ({
    area,
    ...namespace
  }: FrontComponentStorageAreaInput): Record<string, string> => {
    const browserStorage = getBrowserStorage(area);
    const keyPrefix = buildFrontComponentStorageKeyPrefix(namespace);

    return Object.fromEntries(
      getNamespacedKeys(browserStorage, keyPrefix).map((namespacedKey) => [
        namespacedKey.slice(keyPrefix.length),
        browserStorage.getItem(namespacedKey) ?? '',
      ]),
    );
  },

  set: ({
    area,
    key,
    serializedValue,
    ...namespace
  }: FrontComponentStorageAreaInput & {
    key: string;
    serializedValue: string;
  }): void => {
    const browserStorage = getBrowserStorage(area);
    const keyPrefix = buildFrontComponentStorageKeyPrefix(namespace);
    const namespacedKey = `${keyPrefix}${key}`;

    let otherEntriesTotalLength = 0;

    for (const existingNamespacedKey of getNamespacedKeys(
      browserStorage,
      keyPrefix,
    )) {
      if (existingNamespacedKey !== namespacedKey) {
        otherEntriesTotalLength +=
          browserStorage.getItem(existingNamespacedKey)?.length ?? 0;
      }
    }

    const violationMessage = getFrontComponentStorageViolationMessage({
      key,
      serializedValue,
      otherEntriesTotalLength,
    });

    if (isDefined(violationMessage)) {
      throw new Error(violationMessage);
    }

    browserStorage.setItem(namespacedKey, serializedValue);
  },

  delete: ({
    area,
    key,
    ...namespace
  }: FrontComponentStorageAreaInput & { key: string }): void => {
    getBrowserStorage(area).removeItem(
      `${buildFrontComponentStorageKeyPrefix(namespace)}${key}`,
    );
  },

  clear: ({ area, ...namespace }: FrontComponentStorageAreaInput): void => {
    const browserStorage = getBrowserStorage(area);

    for (const namespacedKey of getNamespacedKeys(
      browserStorage,
      buildFrontComponentStorageKeyPrefix(namespace),
    )) {
      browserStorage.removeItem(namespacedKey);
    }
  },
};

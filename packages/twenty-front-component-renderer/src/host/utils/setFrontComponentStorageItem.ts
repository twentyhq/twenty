import { isString } from '@sniptt/guards';
import { CustomError, isDefined } from 'twenty-shared/utils';

import { getNamespacedStorageKeys } from '@/host/utils/getNamespacedStorageKeys';
import { type FrontComponentStorageScope } from '@/types/FrontComponentStorageScope';
import { getFrontComponentStorageViolationMessage } from '@/utils/getFrontComponentStorageViolationMessage';

export const setFrontComponentStorageItem = ({
  namespace,
  storageType,
  key,
  serializedValue,
}: FrontComponentStorageScope & {
  key: string;
  serializedValue: string;
}): void => {
  if (!isString(key) || !isString(serializedValue)) {
    throw new CustomError(
      'Storage keys and values must be strings',
      'FRONT_COMPONENT_STORAGE_INVALID_INPUT',
    );
  }

  const storage = window[storageType];
  const namespacedKey = `${namespace}${key}`;

  let otherEntriesTotalLength = 0;

  for (const existingNamespacedKey of getNamespacedStorageKeys({
    storage,
    namespace,
  })) {
    if (existingNamespacedKey !== namespacedKey) {
      const existingKeyLength = existingNamespacedKey.length - namespace.length;
      const existingValueLength =
        storage.getItem(existingNamespacedKey)?.length ?? 0;

      otherEntriesTotalLength += existingKeyLength + existingValueLength;
    }
  }

  const violationMessage = getFrontComponentStorageViolationMessage({
    key,
    serializedValue,
    otherEntriesTotalLength,
  });

  if (isDefined(violationMessage)) {
    throw new CustomError(
      violationMessage,
      'FRONT_COMPONENT_STORAGE_LIMIT_EXCEEDED',
    );
  }

  storage.setItem(namespacedKey, serializedValue);
};

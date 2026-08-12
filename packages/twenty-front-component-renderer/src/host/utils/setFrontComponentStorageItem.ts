import { isString } from '@sniptt/guards';
import { CustomError, isDefined } from 'twenty-shared/utils';

import { buildFrontComponentStorageKeyPrefix } from '@/host/utils/buildFrontComponentStorageKeyPrefix';
import { getBrowserStorageForArea } from '@/host/utils/getBrowserStorageForArea';
import { getBrowserStorageKeysWithPrefix } from '@/host/utils/getBrowserStorageKeysWithPrefix';
import { type FrontComponentStorageScope } from '@/types/FrontComponentStorageScope';
import { getFrontComponentStorageViolationMessage } from '@/utils/getFrontComponentStorageViolationMessage';

export const setFrontComponentStorageItem = ({
  area,
  key,
  serializedValue,
  ...namespace
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

  const browserStorage = getBrowserStorageForArea(area);
  const keyPrefix = buildFrontComponentStorageKeyPrefix(namespace);
  const namespacedKey = `${keyPrefix}${key}`;

  let otherEntriesTotalLength = 0;

  for (const existingNamespacedKey of getBrowserStorageKeysWithPrefix(
    browserStorage,
    keyPrefix,
  )) {
    if (existingNamespacedKey !== namespacedKey) {
      const existingKeyLength = existingNamespacedKey.length - keyPrefix.length;
      const existingValueLength =
        browserStorage.getItem(existingNamespacedKey)?.length ?? 0;

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

  browserStorage.setItem(namespacedKey, serializedValue);
};

import { buildFrontComponentStorageKeyPrefix } from '@/host/utils/buildFrontComponentStorageKeyPrefix';
import { getBrowserStorageForArea } from '@/host/utils/getBrowserStorageForArea';
import { getBrowserStorageKeysWithPrefix } from '@/host/utils/getBrowserStorageKeysWithPrefix';
import { type FrontComponentStorageScope } from '@/types/FrontComponentStorageScope';

export const clearFrontComponentStorage = ({
  area,
  ...namespace
}: FrontComponentStorageScope): void => {
  const browserStorage = getBrowserStorageForArea(area);

  for (const namespacedKey of getBrowserStorageKeysWithPrefix(
    browserStorage,
    buildFrontComponentStorageKeyPrefix(namespace),
  )) {
    browserStorage.removeItem(namespacedKey);
  }
};

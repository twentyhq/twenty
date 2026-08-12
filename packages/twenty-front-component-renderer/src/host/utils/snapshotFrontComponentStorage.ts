import { buildFrontComponentStorageKeyPrefix } from '@/host/utils/buildFrontComponentStorageKeyPrefix';
import { getBrowserStorageForArea } from '@/host/utils/getBrowserStorageForArea';
import { getBrowserStorageKeysWithPrefix } from '@/host/utils/getBrowserStorageKeysWithPrefix';
import { type FrontComponentStorageScope } from '@/types/FrontComponentStorageScope';

export const snapshotFrontComponentStorage = ({
  area,
  ...namespace
}: FrontComponentStorageScope): Record<string, string> => {
  const browserStorage = getBrowserStorageForArea(area);
  const keyPrefix = buildFrontComponentStorageKeyPrefix(namespace);

  return Object.fromEntries(
    getBrowserStorageKeysWithPrefix(browserStorage, keyPrefix).map(
      (namespacedKey) => [
        namespacedKey.slice(keyPrefix.length),
        browserStorage.getItem(namespacedKey) ?? '',
      ],
    ),
  );
};

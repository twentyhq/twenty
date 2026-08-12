import { buildFrontComponentStorageNamespacePrefix } from '@/host/utils/buildFrontComponentStorageNamespacePrefix';
import { type FrontComponentStorageScope } from '@/types/FrontComponentStorageScope';

export const deleteFrontComponentStorageItem = ({
  storageType,
  key,
  ...namespace
}: FrontComponentStorageScope & { key: string }): void => {
  window[storageType].removeItem(
    `${buildFrontComponentStorageNamespacePrefix(namespace)}${key}`,
  );
};

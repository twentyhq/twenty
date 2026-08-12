import { type FrontComponentStorageScope } from '@/types/FrontComponentStorageScope';

export const deleteFrontComponentStorageItem = ({
  namespace,
  storageType,
  key,
}: FrontComponentStorageScope & { key: string }): void => {
  window[storageType].removeItem(`${namespace}${key}`);
};

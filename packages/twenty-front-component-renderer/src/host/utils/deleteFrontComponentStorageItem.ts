import { buildFrontComponentStorageKeyPrefix } from '@/host/utils/buildFrontComponentStorageKeyPrefix';
import { getBrowserStorageForArea } from '@/host/utils/getBrowserStorageForArea';
import { type FrontComponentStorageScope } from '@/types/FrontComponentStorageScope';

export const deleteFrontComponentStorageItem = ({
  area,
  key,
  ...namespace
}: FrontComponentStorageScope & { key: string }): void => {
  getBrowserStorageForArea(area).removeItem(
    `${buildFrontComponentStorageKeyPrefix(namespace)}${key}`,
  );
};

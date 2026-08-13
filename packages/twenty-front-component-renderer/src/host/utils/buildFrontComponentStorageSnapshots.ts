import { type FrontComponentStorageType } from 'twenty-sdk/front-component';

import { snapshotFrontComponentStorage } from '@/host/utils/snapshotFrontComponentStorage';
import { type FrontComponentStorageSnapshots } from '@/types/FrontComponentStorageSnapshots';

const STORAGE_SNAPSHOT_FAILURE_WARNING =
  'The front component storage could not be read from this device';

const STORAGE_TYPES: FrontComponentStorageType[] = [
  'localStorage',
  'sessionStorage',
];

export const buildFrontComponentStorageSnapshots = (
  namespace: string,
): FrontComponentStorageSnapshots => {
  const snapshots: FrontComponentStorageSnapshots = {
    localStorage: {},
    sessionStorage: {},
  };

  for (const storageType of STORAGE_TYPES) {
    try {
      snapshots[storageType] = snapshotFrontComponentStorage({
        namespace,
        storageType,
      });
    } catch {
      console.warn(STORAGE_SNAPSHOT_FAILURE_WARNING);
    }
  }

  return snapshots;
};

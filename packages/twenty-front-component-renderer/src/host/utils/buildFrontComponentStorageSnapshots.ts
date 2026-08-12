import { type FrontComponentStorageArea } from 'twenty-sdk/front-component';

import { snapshotFrontComponentStorage } from '@/host/utils/snapshotFrontComponentStorage';
import { type FrontComponentStorageNamespace } from '@/types/FrontComponentStorageNamespace';
import { type FrontComponentStorageSnapshots } from '@/types/FrontComponentStorageSnapshots';

const STORAGE_SNAPSHOT_FAILURE_WARNING =
  'The front component storage could not be read from this device';

const STORAGE_AREAS: FrontComponentStorageArea[] = ['local', 'session'];

export const buildFrontComponentStorageSnapshots = (
  namespace: FrontComponentStorageNamespace,
): FrontComponentStorageSnapshots => {
  const snapshots: FrontComponentStorageSnapshots = {
    local: {},
    session: {},
  };

  for (const area of STORAGE_AREAS) {
    try {
      snapshots[area] = snapshotFrontComponentStorage({
        area,
        ...namespace,
      });
    } catch {
      console.warn(STORAGE_SNAPSHOT_FAILURE_WARNING);
    }
  }

  return snapshots;
};

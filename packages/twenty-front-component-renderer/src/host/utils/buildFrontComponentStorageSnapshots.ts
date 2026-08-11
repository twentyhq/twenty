import { type FrontComponentStorageArea } from 'twenty-sdk/front-component';

import { frontComponentStorageService } from '@/host/utils/frontComponentStorageService';
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
      snapshots[area] = frontComponentStorageService.snapshot({
        area,
        ...namespace,
      });
    } catch {
      console.warn(STORAGE_SNAPSHOT_FAILURE_WARNING);
    }
  }

  return snapshots;
};

import { type FrontComponentStorageType } from 'twenty-sdk/front-component';

import { createFrontComponentStorageBridge } from '@/remote/worker/utils/createFrontComponentStorageBridge';
import { type FrontComponentStorageBridge } from '@/types/FrontComponentStorageBridge';

export const frontComponentStorageBridges: Record<
  FrontComponentStorageType,
  FrontComponentStorageBridge
> = {
  localStorage: createFrontComponentStorageBridge({
    storageType: 'localStorage',
  }),
  sessionStorage: createFrontComponentStorageBridge({
    storageType: 'sessionStorage',
  }),
};

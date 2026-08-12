import { type FrontComponentStorageType } from 'twenty-sdk/front-component';

import { frontComponentHostCommunicationApi } from '@/constants/frontComponentHostCommunicationApi';
import { createFrontComponentStorageBridge } from '@/remote/worker/utils/createFrontComponentStorageBridge';
import { type FrontComponentStorageBridge } from '@/types/FrontComponentStorageBridge';

const getHostCommunicationApi = () => frontComponentHostCommunicationApi;

export const frontComponentStorageBridges: Record<
  FrontComponentStorageType,
  FrontComponentStorageBridge
> = {
  localStorage: createFrontComponentStorageBridge({
    storageType: 'localStorage',
    getHostCommunicationApi,
  }),
  sessionStorage: createFrontComponentStorageBridge({
    storageType: 'sessionStorage',
    getHostCommunicationApi,
  }),
};

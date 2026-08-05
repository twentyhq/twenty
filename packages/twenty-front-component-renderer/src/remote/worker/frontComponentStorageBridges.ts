import { type FrontComponentStorageArea } from 'twenty-sdk/front-component';

import { frontComponentHostCommunicationApi } from '@/constants/frontComponentHostCommunicationApi';
import { createFrontComponentStorageBridge } from '@/remote/worker/utils/createFrontComponentStorageBridge';
import { type FrontComponentStorageWorkerBridge } from '@/types/FrontComponentStorageWorkerBridge';

const getHostCommunicationApi = () => frontComponentHostCommunicationApi;

export const frontComponentStorageBridges: Record<
  FrontComponentStorageArea,
  FrontComponentStorageWorkerBridge
> = {
  local: createFrontComponentStorageBridge({
    area: 'local',
    getHostCommunicationApi,
  }),
  session: createFrontComponentStorageBridge({
    area: 'session',
    getHostCommunicationApi,
  }),
};

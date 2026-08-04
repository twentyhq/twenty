import { frontComponentHostCommunicationApi } from '@/constants/frontComponentHostCommunicationApi';
import { createFrontComponentLocalStorageBridge } from '@/remote/worker/utils/createFrontComponentLocalStorageBridge';

export const frontComponentLocalStorageBridge =
  createFrontComponentLocalStorageBridge({
    getHostCommunicationApi: () => frontComponentHostCommunicationApi,
  });

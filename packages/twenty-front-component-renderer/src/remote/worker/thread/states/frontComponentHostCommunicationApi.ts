import { FRONT_COMPONENT_HOST_COMMUNICATION_API_KEY } from 'twenty-sdk/front-component-renderer';

import { type WorkerFrontComponentHostCommunicationApi } from '@/types/WorkerFrontComponentHostCommunicationApi';

(globalThis as Record<string, unknown>)[
  FRONT_COMPONENT_HOST_COMMUNICATION_API_KEY
] ??= {};

export const frontComponentHostCommunicationApi: WorkerFrontComponentHostCommunicationApi =
  (globalThis as Record<string, unknown>)[
    FRONT_COMPONENT_HOST_COMMUNICATION_API_KEY
  ] as WorkerFrontComponentHostCommunicationApi;

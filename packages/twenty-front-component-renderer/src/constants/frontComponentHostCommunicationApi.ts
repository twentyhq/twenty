import { FRONT_COMPONENT_HOST_COMMUNICATION_API_KEY } from 'twenty-sdk/front-component-renderer';

import { type FrontComponentHostCommunicationApiStore } from '@/types/FrontComponentHostCommunicationApiStore';

(globalThis as Record<string, unknown>)[
  FRONT_COMPONENT_HOST_COMMUNICATION_API_KEY
] ??= {};

export const frontComponentHostCommunicationApi: FrontComponentHostCommunicationApiStore =
  (globalThis as Record<string, unknown>)[
    FRONT_COMPONENT_HOST_COMMUNICATION_API_KEY
  ] as FrontComponentHostCommunicationApiStore;

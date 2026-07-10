import { ThreadMessagePort } from '@quilted/threads';

import { FRONT_COMPONENT_HOST_COMMUNICATION_API_NOOP } from '@/host/constants/FrontComponentHostCommunicationApiNoop';
import { type FrontComponentHostThreadExports } from '@/types/FrontComponentHostThreadExports';
import { type FrontComponentThread } from '@/types/FrontComponentThread';
import { type HostFetchFunction } from '@/types/HostFetchFunction';
import { type WorkerExports } from '@/types/WorkerExports';

export const createFrontComponentHostThread = (
  hostMessagePort: MessagePort,
  hostFetch: HostFetchFunction,
): FrontComponentThread => {
  const thread = new ThreadMessagePort<
    WorkerExports,
    FrontComponentHostThreadExports
  >(hostMessagePort, {
    exports: {
      ...FRONT_COMPONENT_HOST_COMMUNICATION_API_NOOP,
      hostFetch,
    },
  });

  hostMessagePort.start();

  return thread;
};

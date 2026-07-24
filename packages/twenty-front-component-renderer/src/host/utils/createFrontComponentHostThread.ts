import { ThreadMessagePort } from '@quilted/threads';

import { FRONT_COMPONENT_HOST_COMMUNICATION_API_NOOP } from '@/host/constants/FrontComponentHostCommunicationApiNoop';
import { type GeometryTracker } from '@/host/types/GeometryTracker';
import { type FrontComponentHostThreadExports } from '@/types/FrontComponentHostThreadExports';
import { type FrontComponentThread } from '@/types/FrontComponentThread';
import { type HostFetchFunction } from '@/types/HostFetchFunction';
import { type WorkerExports } from '@/types/WorkerExports';
import { createClonableErrorThreadSerialization } from '@/utils/createClonableErrorThreadSerialization';

type CreateFrontComponentHostThreadInput = {
  hostMessagePort: MessagePort;
  hostFetch: HostFetchFunction;
  geometryTracker: GeometryTracker;
};

export const createFrontComponentHostThread = ({
  hostMessagePort,
  hostFetch,
  geometryTracker,
}: CreateFrontComponentHostThreadInput): FrontComponentThread => {
  const thread = new ThreadMessagePort<
    WorkerExports,
    FrontComponentHostThreadExports
  >(hostMessagePort, {
    exports: {
      ...FRONT_COMPONENT_HOST_COMMUNICATION_API_NOOP,
      hostFetch,
      observeElementGeometry: async (remoteElementIds) => {
        geometryTracker.observe(remoteElementIds);
      },
      unobserveElementGeometry: async (remoteElementIds) => {
        geometryTracker.unobserve(remoteElementIds);
      },
    },
    serialization: createClonableErrorThreadSerialization(),
  });

  hostMessagePort.start();

  return thread;
};

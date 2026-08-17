import { ThreadMessagePort } from '@quilted/threads';
import { isDefined } from 'twenty-shared/utils';

import { FRONT_COMPONENT_HOST_COMMUNICATION_API_NOOP } from '@/host/thread/constants/FrontComponentHostCommunicationApiNoop';
import { type GeometryTracker } from '@/host/geometry/types/GeometryTracker';
import { type FrontComponentMediaSessionHost } from '@/host/media/types/FrontComponentMediaSessionHost';
import { type FrontComponentHostThreadExports } from '@/types/FrontComponentHostThreadExports';
import { type FrontComponentThread } from '@/types/FrontComponentThread';
import { type HostFetchFunction } from '@/types/HostFetchFunction';
import { type MediaSessionHostFunctions } from '@/types/MediaSession';
import { type WorkerExports } from '@/types/WorkerExports';
import { createClonableErrorThreadSerialization } from '@/utils/clonable-error/createClonableErrorThreadSerialization';

type CreateFrontComponentHostThreadInput = {
  hostMessagePort: MessagePort;
  hostFetch: HostFetchFunction;
  geometryTracker: GeometryTracker;
  mediaSessionHost?: FrontComponentMediaSessionHost;
};

const MEDIA_SESSION_UNAVAILABLE_FAILURE = {
  status: 'failed',
  errorName: 'NotSupportedError',
  errorMessage: 'Media capture is not available in this surface',
} as const;

const buildMediaSessionThreadExports = (
  mediaSessionHost?: FrontComponentMediaSessionHost,
): MediaSessionHostFunctions => {
  if (isDefined(mediaSessionHost)) {
    return {
      mediaStartStream: mediaSessionHost.mediaStartStream,
      mediaStopStreamTrack: mediaSessionHost.mediaStopStreamTrack,
      mediaSetTrackEnabled: mediaSessionHost.mediaSetTrackEnabled,
      mediaStartRecorder: mediaSessionHost.mediaStartRecorder,
      mediaStopRecorder: mediaSessionHost.mediaStopRecorder,
      mediaPauseRecorder: mediaSessionHost.mediaPauseRecorder,
      mediaResumeRecorder: mediaSessionHost.mediaResumeRecorder,
      mediaRequestRecorderData: mediaSessionHost.mediaRequestRecorderData,
    };
  }

  return {
    mediaStartStream: async () => MEDIA_SESSION_UNAVAILABLE_FAILURE,
    mediaStopStreamTrack: async () => {},
    mediaSetTrackEnabled: async () => {},
    mediaStartRecorder: async () => MEDIA_SESSION_UNAVAILABLE_FAILURE,
    mediaStopRecorder: async () => {},
    mediaPauseRecorder: async () => {},
    mediaResumeRecorder: async () => {},
    mediaRequestRecorderData: async () => {},
  };
};

export const createFrontComponentHostThread = ({
  hostMessagePort,
  hostFetch,
  geometryTracker,
  mediaSessionHost,
}: CreateFrontComponentHostThreadInput): FrontComponentThread => {
  const thread = new ThreadMessagePort<
    WorkerExports,
    FrontComponentHostThreadExports
  >(hostMessagePort, {
    exports: {
      ...FRONT_COMPONENT_HOST_COMMUNICATION_API_NOOP,
      ...buildMediaSessionThreadExports(mediaSessionHost),
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

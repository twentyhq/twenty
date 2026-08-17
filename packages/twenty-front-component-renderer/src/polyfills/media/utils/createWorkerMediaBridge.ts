import { isDefined } from 'twenty-shared/utils';

import { MEDIA_TRANSPORT_FAILURE_WARNING } from '@/polyfills/media/constants/MediaTransportFailureWarning';
import {
  type WorkerMediaBridge,
  type WorkerMediaRecorderEventHandlers,
  type WorkerMediaTrackEventHandlers,
} from '@/polyfills/media/types/WorkerMediaBridge';
import {
  type MediaRecorderCapabilities,
  type MediaSessionHostFunctions,
  type StartMediaRecorderResult,
  type StartMediaStreamResult,
} from '@/types/MediaSession';

const buildTrackKey = (streamId: string, trackId: string): string =>
  `${streamId}:${trackId}`;

const MEDIA_TRANSPORT_UNAVAILABLE_FAILURE = {
  status: 'failed',
  errorName: 'NotSupportedError',
  errorMessage: 'Media capture is not available in this environment',
} as const;

export const createWorkerMediaBridge = (): WorkerMediaBridge => {
  const trackEventHandlersByTrackKey = new Map<
    string,
    WorkerMediaTrackEventHandlers
  >();
  const recorderEventHandlersByRecorderId = new Map<
    string,
    WorkerMediaRecorderEventHandlers
  >();
  const supportedRecorderMimeTypes = new Set<string>();

  let transport: MediaSessionHostFunctions | null = null;
  let hasWarnedAboutTransportFailure = false;

  const warnAboutTransportFailure = (): void => {
    if (hasWarnedAboutTransportFailure) {
      return;
    }

    hasWarnedAboutTransportFailure = true;
    console.warn(MEDIA_TRANSPORT_FAILURE_WARNING);
  };

  const connectTransport = (nextTransport: MediaSessionHostFunctions): void => {
    transport = nextTransport;
  };

  const seedRecorderCapabilities = (
    capabilities: MediaRecorderCapabilities,
  ): void => {
    for (const mimeType of capabilities.supportedMimeTypes) {
      supportedRecorderMimeTypes.add(mimeType.trim().toLowerCase());
    }
  };

  const isRecorderMimeTypeSupported = (mimeType: string): boolean => {
    // The spec treats the empty string as "no preference", which is always
    // supported.
    if (mimeType === '') {
      return true;
    }

    return supportedRecorderMimeTypes.has(mimeType.trim().toLowerCase());
  };

  const startStream = async (params: {
    audio: boolean;
    video: boolean;
  }): Promise<StartMediaStreamResult> => {
    if (!isDefined(transport)) {
      return MEDIA_TRANSPORT_UNAVAILABLE_FAILURE;
    }

    try {
      return await transport.mediaStartStream(params);
    } catch {
      return MEDIA_TRANSPORT_UNAVAILABLE_FAILURE;
    }
  };

  const registerTrackEventHandlers = ({
    streamId,
    trackId,
    handlers,
  }: {
    streamId: string;
    trackId: string;
    handlers: WorkerMediaTrackEventHandlers;
  }): void => {
    trackEventHandlersByTrackKey.set(
      buildTrackKey(streamId, trackId),
      handlers,
    );
  };

  const stopStreamTrack = ({
    streamId,
    trackId,
  }: {
    streamId: string;
    trackId: string;
  }): void => {
    // A self-initiated stop expects no further events for the track.
    trackEventHandlersByTrackKey.delete(buildTrackKey(streamId, trackId));

    if (!isDefined(transport)) {
      warnAboutTransportFailure();
      return;
    }

    transport
      .mediaStopStreamTrack({ streamId, trackId })
      .catch(warnAboutTransportFailure);
  };

  const setStreamTrackEnabled = ({
    streamId,
    trackId,
    enabled,
  }: {
    streamId: string;
    trackId: string;
    enabled: boolean;
  }): void => {
    if (!isDefined(transport)) {
      warnAboutTransportFailure();
      return;
    }

    transport
      .mediaSetTrackEnabled({ streamId, trackId, enabled })
      .catch(warnAboutTransportFailure);
  };

  const startRecorder = async ({
    streamId,
    mimeType,
    timesliceMs,
    handlers,
  }: {
    streamId: string;
    mimeType?: string;
    timesliceMs?: number;
    handlers: WorkerMediaRecorderEventHandlers;
  }): Promise<StartMediaRecorderResult> => {
    if (!isDefined(transport)) {
      return MEDIA_TRANSPORT_UNAVAILABLE_FAILURE;
    }

    let result: StartMediaRecorderResult;

    try {
      result = await transport.mediaStartRecorder({
        streamId,
        mimeType,
        timesliceMs,
      });
    } catch {
      return MEDIA_TRANSPORT_UNAVAILABLE_FAILURE;
    }

    // Events for this recorder can only arrive after this response: both
    // travel the same message port, so registering now cannot miss any.
    if (result.status === 'started') {
      recorderEventHandlersByRecorderId.set(result.recorderId, handlers);
    }

    return result;
  };

  const callRecorderTransport = (
    recorderId: string,
    callTransport: (
      connectedTransport: MediaSessionHostFunctions,
    ) => Promise<void>,
  ): void => {
    if (!isDefined(transport)) {
      warnAboutTransportFailure();
      return;
    }

    callTransport(transport).catch(warnAboutTransportFailure);
  };

  const stopRecorder = (recorderId: string): void => {
    callRecorderTransport(recorderId, (connectedTransport) =>
      connectedTransport.mediaStopRecorder({ recorderId }),
    );
  };

  const pauseRecorder = (recorderId: string): void => {
    callRecorderTransport(recorderId, (connectedTransport) =>
      connectedTransport.mediaPauseRecorder({ recorderId }),
    );
  };

  const resumeRecorder = (recorderId: string): void => {
    callRecorderTransport(recorderId, (connectedTransport) =>
      connectedTransport.mediaResumeRecorder({ recorderId }),
    );
  };

  const requestRecorderData = (recorderId: string): void => {
    callRecorderTransport(recorderId, (connectedTransport) =>
      connectedTransport.mediaRequestRecorderData({ recorderId }),
    );
  };

  const dispatchEvents: WorkerMediaBridge['dispatchEvents'] = (batch) => {
    for (const event of batch.events) {
      switch (event.type) {
        case 'track-ended': {
          const trackKey = buildTrackKey(event.streamId, event.trackId);
          const handlers = trackEventHandlersByTrackKey.get(trackKey);

          trackEventHandlersByTrackKey.delete(trackKey);
          handlers?.onEnded();
          break;
        }
        case 'recorder-data': {
          recorderEventHandlersByRecorderId
            .get(event.recorderId)
            ?.onData(event.data);
          break;
        }
        case 'recorder-stop': {
          const handlers = recorderEventHandlersByRecorderId.get(
            event.recorderId,
          );

          recorderEventHandlersByRecorderId.delete(event.recorderId);
          handlers?.onStop();
          break;
        }
        case 'recorder-error': {
          recorderEventHandlersByRecorderId
            .get(event.recorderId)
            ?.onError(event.errorMessage);
          break;
        }
      }
    }
  };

  return {
    connectTransport,
    seedRecorderCapabilities,
    isRecorderMimeTypeSupported,
    startStream,
    registerTrackEventHandlers,
    stopStreamTrack,
    setStreamTrackEnabled,
    startRecorder,
    stopRecorder,
    pauseRecorder,
    resumeRecorder,
    requestRecorderData,
    dispatchEvents,
  };
};

import { isDefined } from 'twenty-shared/utils';

import { MEDIA_RECORDER_CANDIDATE_MIME_TYPES } from '@/host/media/constants/MediaRecorderCandidateMimeTypes';
import { generateRandomId } from '@/utils/generateRandomId';
import {
  type CreateFrontComponentMediaSessionHostInput,
  type FrontComponentActiveMediaSession,
  type FrontComponentMediaSessionHost,
  type MediaSessionEventTransport,
} from '@/host/media/types/FrontComponentMediaSessionHost';
import {
  type MediaSessionEvent,
  type MediaSessionMediaType,
  type StartMediaRecorderResult,
  type StartMediaStreamResult,
} from '@/types/MediaSession';

type HostStreamSession = {
  streamId: string;
  mediaType: MediaSessionMediaType;
  startedAt: number;
  mediaStream: MediaStream;
};

type HostRecorderSession = {
  recorderId: string;
  streamId: string;
  mediaRecorder: MediaRecorder;
};

// One capture at a time across every session host on the page. The
// reservation is scoped to the mediaStartStream call itself (released in
// its finally), so no callback ordering can leak or double-release it.
let isCaptureSlotReserved = false;
let liveCaptureSessionCount = 0;

const CAPTURE_SLOT_BUSY_FAILURE = {
  status: 'failed',
  errorName: 'NotReadableError',
  errorMessage: 'A recording is already in progress',
} as const;

const toFailure = (
  error: unknown,
): { status: 'failed'; errorName: string; errorMessage: string } => ({
  status: 'failed',
  errorName: error instanceof Error ? error.name : 'UnknownError',
  errorMessage: error instanceof Error ? error.message : String(error),
});

export const createFrontComponentMediaSessionHost = ({
  beforeStartStream,
  onActiveSessionsChange,
}: CreateFrontComponentMediaSessionHostInput = {}): FrontComponentMediaSessionHost => {
  const streamSessions = new Map<string, HostStreamSession>();
  const recorderSessions = new Map<string, HostRecorderSession>();

  let transport: MediaSessionEventTransport | null = null;
  // Bumped by stopAllSessions so a getUserMedia still pending at teardown
  // cannot register a stream nobody owns anymore.
  let teardownGeneration = 0;
  // Recorder chunks must survive the window before the worker transport is
  // connected, so events buffer instead of dropping.
  let bufferedEvents: MediaSessionEvent[] = [];

  const pushEvents = (events: MediaSessionEvent[]): void => {
    if (events.length === 0) {
      return;
    }

    if (!isDefined(transport)) {
      bufferedEvents.push(...events);
      return;
    }

    transport.pushMediaSessionEvents({ events }).catch(() => {
      console.warn(
        'A media session event could not reach the front component worker',
      );
    });
  };

  const notifyActiveSessionsChange = (): void => {
    if (!isDefined(onActiveSessionsChange)) {
      return;
    }

    const activeSessions: FrontComponentActiveMediaSession[] = [
      ...streamSessions.values(),
    ]
      .filter((session) =>
        session.mediaStream
          .getTracks()
          .some((track) => track.readyState === 'live'),
      )
      .sort(
        (leftSession, rightSession) =>
          leftSession.startedAt - rightSession.startedAt,
      )
      .map((session) => ({
        streamId: session.streamId,
        mediaType: session.mediaType,
        startedAt: session.startedAt,
        getLiveMediaStream: () =>
          streamSessions.has(session.streamId) ? session.mediaStream : null,
      }));

    onActiveSessionsChange(activeSessions);
  };

  const cleanUpStreamSessionIfEnded = (streamId: string): void => {
    const session = streamSessions.get(streamId);

    if (!isDefined(session)) {
      return;
    }

    const hasLiveTrack = session.mediaStream
      .getTracks()
      .some((track) => track.readyState === 'live');

    if (hasLiveTrack) {
      return;
    }

    streamSessions.delete(streamId);
    liveCaptureSessionCount = Math.max(0, liveCaptureSessionCount - 1);
    notifyActiveSessionsChange();
  };

  const mediaStartStream = async ({
    audio,
    video,
  }: {
    audio: boolean;
    video: boolean;
  }): Promise<StartMediaStreamResult> => {
    if (isCaptureSlotReserved || liveCaptureSessionCount > 0) {
      return CAPTURE_SLOT_BUSY_FAILURE;
    }

    isCaptureSlotReserved = true;

    try {
      return await startStreamWithReservedSlot({ audio, video });
    } finally {
      isCaptureSlotReserved = false;
    }
  };

  const startStreamWithReservedSlot = async ({
    audio,
    video,
  }: {
    audio: boolean;
    video: boolean;
  }): Promise<StartMediaStreamResult> => {
    const mediaType: MediaSessionMediaType = video ? 'video' : 'audio';
    const veto = beforeStartStream?.(mediaType) ?? null;

    if (isDefined(veto)) {
      return { status: 'failed', ...veto };
    }

    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      return {
        status: 'failed',
        errorName: 'NotSupportedError',
        errorMessage: 'Media capture is not available in this environment',
      };
    }

    const startGeneration = teardownGeneration;

    let mediaStream: MediaStream;

    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        audio,
        video,
      });
    } catch (error) {
      return toFailure(error);
    }

    if (startGeneration !== teardownGeneration) {
      for (const track of mediaStream.getTracks()) {
        track.stop();
      }

      return {
        status: 'failed',
        errorName: 'AbortError',
        errorMessage: 'The capture was interrupted',
      };
    }

    const streamId = generateRandomId();

    streamSessions.set(streamId, {
      streamId,
      mediaType,
      startedAt: Date.now(),
      mediaStream,
    });
    liveCaptureSessionCount += 1;

    for (const track of mediaStream.getTracks()) {
      // Fires for external endings (device unplugged, permission revoked),
      // not for stop() calls: those are reported to the worker explicitly.
      track.addEventListener('ended', () => {
        pushEvents([{ type: 'track-ended', streamId, trackId: track.id }]);
        cleanUpStreamSessionIfEnded(streamId);
      });
    }

    notifyActiveSessionsChange();

    return {
      status: 'started',
      streamId,
      tracks: mediaStream.getTracks().map((track) => ({
        trackId: track.id,
        kind: track.kind === 'video' ? 'video' : 'audio',
      })),
    };
  };

  const mediaStopStreamTrack = async ({
    streamId,
    trackId,
  }: {
    streamId: string;
    trackId: string;
  }): Promise<void> => {
    const session = streamSessions.get(streamId);

    if (!isDefined(session)) {
      return;
    }

    const track = session.mediaStream
      .getTracks()
      .find((sessionTrack) => sessionTrack.id === trackId);

    track?.stop();
    cleanUpStreamSessionIfEnded(streamId);
  };

  const mediaSetTrackEnabled = async ({
    streamId,
    trackId,
    enabled,
  }: {
    streamId: string;
    trackId: string;
    enabled: boolean;
  }): Promise<void> => {
    const session = streamSessions.get(streamId);

    if (!isDefined(session)) {
      return;
    }

    const track = session.mediaStream
      .getTracks()
      .find((sessionTrack) => sessionTrack.id === trackId);

    if (isDefined(track)) {
      track.enabled = enabled;
    }
  };

  const mediaStartRecorder = async ({
    streamId,
    mimeType,
    timesliceMs,
  }: {
    streamId: string;
    mimeType?: string;
    timesliceMs?: number;
  }): Promise<StartMediaRecorderResult> => {
    const session = streamSessions.get(streamId);

    if (!isDefined(session)) {
      return {
        status: 'failed',
        errorName: 'NotFoundError',
        errorMessage: 'No live capture stream matches this recording request',
      };
    }

    let mediaRecorder: MediaRecorder;

    try {
      mediaRecorder = new MediaRecorder(
        session.mediaStream,
        isDefined(mimeType) ? { mimeType } : undefined,
      );
    } catch (error) {
      return toFailure(error);
    }

    const recorderId = generateRandomId();

    mediaRecorder.addEventListener('dataavailable', (event) => {
      pushEvents([{ type: 'recorder-data', recorderId, data: event.data }]);
    });

    mediaRecorder.addEventListener('stop', () => {
      recorderSessions.delete(recorderId);
      pushEvents([{ type: 'recorder-stop', recorderId }]);
    });

    mediaRecorder.addEventListener('error', (event) => {
      const errorEvent = event as Event & { error?: Error };

      pushEvents([
        {
          type: 'recorder-error',
          recorderId,
          errorMessage:
            errorEvent.error?.message ?? 'The media recorder failed',
        },
      ]);
    });

    try {
      mediaRecorder.start(timesliceMs);
    } catch (error) {
      return toFailure(error);
    }

    recorderSessions.set(recorderId, { recorderId, streamId, mediaRecorder });

    return {
      status: 'started',
      recorderId,
      mimeType: mediaRecorder.mimeType,
    };
  };

  const mediaStopRecorder = async ({
    recorderId,
  }: {
    recorderId: string;
  }): Promise<void> => {
    const session = recorderSessions.get(recorderId);

    if (isDefined(session) && session.mediaRecorder.state !== 'inactive') {
      session.mediaRecorder.stop();
    }
  };

  const mediaPauseRecorder = async ({
    recorderId,
  }: {
    recorderId: string;
  }): Promise<void> => {
    const session = recorderSessions.get(recorderId);

    if (isDefined(session) && session.mediaRecorder.state === 'recording') {
      session.mediaRecorder.pause();
    }
  };

  const mediaResumeRecorder = async ({
    recorderId,
  }: {
    recorderId: string;
  }): Promise<void> => {
    const session = recorderSessions.get(recorderId);

    if (isDefined(session) && session.mediaRecorder.state === 'paused') {
      session.mediaRecorder.resume();
    }
  };

  const mediaRequestRecorderData = async ({
    recorderId,
  }: {
    recorderId: string;
  }): Promise<void> => {
    const session = recorderSessions.get(recorderId);

    if (isDefined(session) && session.mediaRecorder.state !== 'inactive') {
      session.mediaRecorder.requestData();
    }
  };

  const stopAllSessions = (): void => {
    teardownGeneration += 1;

    for (const recorderSession of recorderSessions.values()) {
      if (recorderSession.mediaRecorder.state !== 'inactive') {
        recorderSession.mediaRecorder.stop();
      }
    }

    const endedTrackEvents: MediaSessionEvent[] = [];

    for (const streamSession of streamSessions.values()) {
      for (const track of streamSession.mediaStream.getTracks()) {
        if (track.readyState !== 'live') {
          continue;
        }

        track.stop();
        // stop() fires no native ended event, so the worker is told
        // explicitly that its tracks are gone.
        endedTrackEvents.push({
          type: 'track-ended',
          streamId: streamSession.streamId,
          trackId: track.id,
        });
      }
    }

    pushEvents(endedTrackEvents);
    liveCaptureSessionCount = Math.max(
      0,
      liveCaptureSessionCount - streamSessions.size,
    );
    streamSessions.clear();
    notifyActiveSessionsChange();
  };

  const connectEventTransport = (
    nextTransport: MediaSessionEventTransport,
  ): void => {
    transport = nextTransport;

    const eventsToFlush = bufferedEvents;
    bufferedEvents = [];
    pushEvents(eventsToFlush);
  };

  const disconnectEventTransport = (): void => {
    transport = null;
  };

  const getRecorderCapabilities = () => ({
    supportedMimeTypes:
      typeof MediaRecorder === 'undefined'
        ? []
        : MEDIA_RECORDER_CANDIDATE_MIME_TYPES.filter((candidateMimeType) =>
            MediaRecorder.isTypeSupported(candidateMimeType),
          ),
  });

  return {
    mediaStartStream,
    mediaStopStreamTrack,
    mediaSetTrackEnabled,
    mediaStartRecorder,
    mediaStopRecorder,
    mediaPauseRecorder,
    mediaResumeRecorder,
    mediaRequestRecorderData,
    connectEventTransport,
    disconnectEventTransport,
    stopAllSessions,
    getRecorderCapabilities,
  };
};

import { isDefined } from 'twenty-shared/utils';

import { MEDIA_RECORDER_CANDIDATE_MIME_TYPES } from '@/host/media/constants/MediaRecorderCandidateMimeTypes';
import { MEDIA_SESSION_MEDIA_TYPES } from '@/host/media/constants/MediaSessionMediaTypes';
import { toMediaSessionMediaTypes } from '@/host/media/utils/toMediaSessionMediaTypes';
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
  startedAt: number;
  mediaStream: MediaStream;
};

type HostRecorderSession = {
  recorderId: string;
  streamId: string;
  mediaRecorder: MediaRecorder;
};

type MediaStreamStartFailure = Extract<
  StartMediaStreamResult,
  { status: 'failed' }
>;

type MediaStreamStartOutcome =
  | { status: 'resolved'; mediaStream: MediaStream }
  | { status: 'rejected'; error: unknown };

const MEDIA_START_TIMEOUT_MS = 60_000;

const CAPTURE_SLOT_BUSY_FAILURE = {
  status: 'failed',
  errorName: 'NotReadableError',
  errorMessage: 'This component already has a pending or active capture',
} as const;

const MEDIA_POLICY_REQUIRED_FAILURE = {
  status: 'failed',
  errorName: 'NotAllowedError',
  errorMessage: 'Media capture is not authorized by the host application',
} as const;

const EMPTY_MEDIA_REQUEST_FAILURE = {
  status: 'failed',
  errorName: 'TypeError',
  errorMessage: 'At least one media type must be requested',
} as const;

const MEDIA_START_TIMEOUT_FAILURE = {
  status: 'failed',
  errorName: 'TimeoutError',
  errorMessage: 'The media capture request timed out',
} as const;

const MEDIA_START_CANCELLED_FAILURE = {
  status: 'failed',
  errorName: 'AbortError',
  errorMessage: 'The media capture request was cancelled',
} as const;

const toFailure = (
  error: unknown,
): { status: 'failed'; errorName: string; errorMessage: string } => ({
  status: 'failed',
  errorName: error instanceof Error ? error.name : 'UnknownError',
  errorMessage: error instanceof Error ? error.message : String(error),
});

const notifyListener = (notify: () => void): void => {
  try {
    notify();
  } catch {
    console.warn('A front component media session listener failed');
  }
};

const stopLateMediaStream = (
  mediaStreamPromise: Promise<MediaStreamStartOutcome>,
): void => {
  void mediaStreamPromise.then((lateOutcome) => {
    if (lateOutcome.status !== 'resolved') {
      return;
    }

    for (const track of lateOutcome.mediaStream.getTracks()) {
      track.stop();
    }
  });
};

const getLiveMediaTypes = (
  mediaStream: MediaStream,
): MediaSessionMediaType[] => {
  const liveMediaTypes = new Set(
    mediaStream
      .getTracks()
      .filter((track) => track.readyState === 'live')
      .map((track) => (track.kind === 'video' ? 'video' : 'audio')),
  );

  return MEDIA_SESSION_MEDIA_TYPES.filter((mediaType) =>
    liveMediaTypes.has(mediaType),
  );
};

export const createFrontComponentMediaSessionHost = ({
  beforeStartStream,
  onActiveSessionsChange,
  onPendingStartChange,
}: CreateFrontComponentMediaSessionHostInput = {}): FrontComponentMediaSessionHost => {
  const streamSessions = new Map<string, HostStreamSession>();
  const recorderSessions = new Map<string, HostRecorderSession>();

  let isCaptureSlotReserved = false;
  let isMediaPolicyRequestPending = false;
  let liveCaptureSessionCount = 0;
  let transport: MediaSessionEventTransport | null = null;
  // Bumped by stopAllSessions so a getUserMedia still pending at teardown
  // cannot register a stream nobody owns anymore.
  let teardownGeneration = 0;
  let cancelPendingStart: (() => void) | null = null;
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
        mediaTypes: getLiveMediaTypes(session.mediaStream),
        startedAt: session.startedAt,
        getLiveMediaStream: () =>
          streamSessions.has(session.streamId) ? session.mediaStream : null,
      }));

    notifyListener(() => onActiveSessionsChange(activeSessions));
  };

  const refreshStreamSessionLiveness = (streamId: string): void => {
    const session = streamSessions.get(streamId);

    if (!isDefined(session)) {
      return;
    }

    const hasLiveTrack = session.mediaStream
      .getTracks()
      .some((track) => track.readyState === 'live');

    if (!hasLiveTrack) {
      streamSessions.delete(streamId);
      liveCaptureSessionCount = Math.max(0, liveCaptureSessionCount - 1);
    }

    notifyActiveSessionsChange();
  };

  const mediaStartStream = async ({
    audio,
    video,
  }: {
    audio: boolean;
    video: boolean;
  }): Promise<StartMediaStreamResult> => {
    const mediaTypes = toMediaSessionMediaTypes({ audio, video });

    if (mediaTypes.length === 0) {
      return EMPTY_MEDIA_REQUEST_FAILURE;
    }

    if (!isDefined(beforeStartStream)) {
      return MEDIA_POLICY_REQUIRED_FAILURE;
    }

    if (
      isMediaPolicyRequestPending ||
      isCaptureSlotReserved ||
      liveCaptureSessionCount > 0
    ) {
      return CAPTURE_SLOT_BUSY_FAILURE;
    }

    isMediaPolicyRequestPending = true;
    let resolveInterruptedPolicy: (
      failure: MediaStreamStartFailure,
    ) => void = () => undefined;
    const interruptedPolicyPromise = new Promise<MediaStreamStartFailure>(
      (resolve) => {
        resolveInterruptedPolicy = resolve;
      },
    );
    const policyAbortController = new AbortController();
    const policyPromise = Promise.resolve()
      .then(() =>
        beforeStartStream({
          mediaTypes,
          abortSignal: policyAbortController.signal,
        }),
      )
      .then(
        (veto) => ({ status: 'resolved', veto }) as const,
        (error: unknown) => ({ status: 'rejected', error }) as const,
      );

    let policyOutcome: Awaited<typeof policyPromise> | MediaStreamStartFailure;
    let policyTimeoutId: ReturnType<typeof setTimeout> | undefined;

    try {
      cancelPendingStart = () => {
        resolveInterruptedPolicy(MEDIA_START_CANCELLED_FAILURE);
        policyAbortController.abort();
      };
      notifyListener(() => onPendingStartChange?.(mediaTypes));
      policyTimeoutId = setTimeout(() => {
        resolveInterruptedPolicy(MEDIA_START_TIMEOUT_FAILURE);
        policyAbortController.abort();
      }, MEDIA_START_TIMEOUT_MS);

      policyOutcome = await Promise.race([
        policyPromise,
        interruptedPolicyPromise,
      ]);
    } finally {
      clearTimeout(policyTimeoutId);
      cancelPendingStart = null;
      isMediaPolicyRequestPending = false;
      notifyListener(() => onPendingStartChange?.(null));
    }

    if ('errorName' in policyOutcome) {
      return policyOutcome;
    }

    if (policyOutcome.status === 'rejected') {
      return toFailure(policyOutcome.error);
    }

    if (isDefined(policyOutcome.veto)) {
      return { status: 'failed', ...policyOutcome.veto };
    }

    if (isCaptureSlotReserved || liveCaptureSessionCount > 0) {
      return CAPTURE_SLOT_BUSY_FAILURE;
    }

    isCaptureSlotReserved = true;

    try {
      return await startStreamWithReservedSlot({ mediaTypes });
    } finally {
      isCaptureSlotReserved = false;
    }
  };

  const startStreamWithReservedSlot = async ({
    mediaTypes,
  }: {
    mediaTypes: MediaSessionMediaType[];
  }): Promise<StartMediaStreamResult> => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      return {
        status: 'failed',
        errorName: 'NotSupportedError',
        errorMessage: 'Media capture is not available in this environment',
      };
    }

    const startGeneration = teardownGeneration;
    let resolveInterruptedStart: (
      failure: MediaStreamStartFailure,
    ) => void = () => undefined;
    const interruptedStartPromise = new Promise<MediaStreamStartFailure>(
      (resolve) => {
        resolveInterruptedStart = resolve;
      },
    );
    let mediaStreamPromise: Promise<MediaStreamStartOutcome>;

    try {
      mediaStreamPromise = navigator.mediaDevices
        .getUserMedia({
          audio: mediaTypes.includes('audio'),
          video: mediaTypes.includes('video'),
        })
        .then(
          (mediaStream) => ({ status: 'resolved', mediaStream }) as const,
          (error: unknown) => ({ status: 'rejected', error }) as const,
        );
    } catch (error) {
      return toFailure(error);
    }

    let startTimeoutId: ReturnType<typeof setTimeout> | undefined;
    let startOutcome:
      | MediaStreamStartOutcome
      | MediaStreamStartFailure
      | undefined;

    try {
      cancelPendingStart = () => {
        resolveInterruptedStart(MEDIA_START_CANCELLED_FAILURE);
      };
      notifyListener(() => onPendingStartChange?.(mediaTypes));

      startTimeoutId = setTimeout(() => {
        resolveInterruptedStart(MEDIA_START_TIMEOUT_FAILURE);
      }, MEDIA_START_TIMEOUT_MS);

      startOutcome = await Promise.race([
        mediaStreamPromise,
        interruptedStartPromise,
      ]);
    } finally {
      clearTimeout(startTimeoutId);
      cancelPendingStart = null;

      if (!isDefined(startOutcome)) {
        stopLateMediaStream(mediaStreamPromise);
      }

      notifyListener(() => onPendingStartChange?.(null));
    }

    if ('errorName' in startOutcome) {
      stopLateMediaStream(mediaStreamPromise);

      return startOutcome;
    }

    if (startOutcome.status === 'rejected') {
      return toFailure(startOutcome.error);
    }

    const { mediaStream } = startOutcome;

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
      startedAt: Date.now(),
      mediaStream,
    });
    liveCaptureSessionCount += 1;

    for (const track of mediaStream.getTracks()) {
      // Fires for external endings (device unplugged, permission revoked),
      // not for stop() calls: those are reported to the worker explicitly.
      track.addEventListener('ended', () => {
        pushEvents([{ type: 'track-ended', streamId, trackId: track.id }]);
        refreshStreamSessionLiveness(streamId);
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
    refreshStreamSessionLiveness(streamId);
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
    cancelPendingStart?.();

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

export type MediaSessionMediaType = 'audio' | 'video';

export type MediaSessionTrackDescriptor = {
  trackId: string;
  kind: MediaSessionMediaType;
};

// Failures carry the standard DOMException name (NotAllowedError,
// NotFoundError, NotReadableError, ...) so the worker polyfill can reject
// with the same error shape native getUserMedia produces.
export type StartMediaStreamResult =
  | {
      status: 'started';
      streamId: string;
      tracks: MediaSessionTrackDescriptor[];
    }
  | { status: 'failed'; errorName: string; errorMessage: string };

export type StartMediaRecorderResult =
  | { status: 'started'; recorderId: string; mimeType: string }
  | { status: 'failed'; errorName: string; errorMessage: string };

export type MediaSessionEvent =
  | { type: 'track-ended'; streamId: string; trackId: string }
  | { type: 'recorder-data'; recorderId: string; data: Blob }
  | { type: 'recorder-stop'; recorderId: string }
  | { type: 'recorder-error'; recorderId: string; errorMessage: string };

export type MediaSessionEventBatch = {
  events: MediaSessionEvent[];
};

export type MediaRecorderCapabilities = {
  supportedMimeTypes: string[];
};

// Media capture crosses the sandbox boundary like hostFetch and geometry:
// as dedicated thread functions owned by the renderer, not through the
// application-facing host communication api.
export type MediaSessionHostFunctions = {
  // The requested kinds are forwarded as booleans so video-only capture
  // does not silently open the microphone.
  mediaStartStream: (params: {
    audio: boolean;
    video: boolean;
  }) => Promise<StartMediaStreamResult>;
  mediaStopStreamTrack: (params: {
    streamId: string;
    trackId: string;
  }) => Promise<void>;
  // track.enabled must reach the real track: a worker-local flag would let
  // an application believe it muted a device that is still being captured.
  mediaSetTrackEnabled: (params: {
    streamId: string;
    trackId: string;
    enabled: boolean;
  }) => Promise<void>;
  mediaStartRecorder: (params: {
    streamId: string;
    mimeType?: string;
    timesliceMs?: number;
  }) => Promise<StartMediaRecorderResult>;
  mediaStopRecorder: (params: { recorderId: string }) => Promise<void>;
  mediaPauseRecorder: (params: { recorderId: string }) => Promise<void>;
  mediaResumeRecorder: (params: { recorderId: string }) => Promise<void>;
  mediaRequestRecorderData: (params: { recorderId: string }) => Promise<void>;
};

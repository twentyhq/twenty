export type MediaSessionMediaType = 'audio' | 'video';

export type MediaSessionTrackDescriptor = {
  trackId: string;
  kind: MediaSessionMediaType;
};

// Standard DOMException names, so the polyfill rejects like native getUserMedia.
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

// Renderer-owned thread functions, not part of the application-facing host communication api.
export type MediaSessionHostFunctions = {
  // Per-kind booleans so video-only capture doesn't silently open the microphone.
  mediaStartStream: (params: {
    audio: boolean;
    video: boolean;
  }) => Promise<StartMediaStreamResult>;
  mediaStopStreamTrack: (params: {
    streamId: string;
    trackId: string;
  }) => Promise<void>;
  // Must reach the real track, or an app could believe it muted a device still capturing.
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

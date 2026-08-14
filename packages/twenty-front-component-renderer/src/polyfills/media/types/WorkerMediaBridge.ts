import {
  type MediaRecorderCapabilities,
  type MediaSessionEventBatch,
  type MediaSessionHostFunctions,
  type MediaSessionMediaType,
  type StartMediaRecorderResult,
  type StartMediaStreamResult,
} from '@/types/MediaSession';

export type WorkerMediaTrackEventHandlers = {
  onEnded: () => void;
};

export type WorkerMediaRecorderEventHandlers = {
  onData: (data: Blob) => void;
  onStop: () => void;
  onError: (errorMessage: string) => void;
};

export type WorkerMediaBridge = {
  connectTransport: (transport: MediaSessionHostFunctions) => void;
  seedRecorderCapabilities: (capabilities: MediaRecorderCapabilities) => void;
  isRecorderMimeTypeSupported: (mimeType: string) => boolean;
  startStream: (params: {
    mediaType: MediaSessionMediaType;
  }) => Promise<StartMediaStreamResult>;
  registerTrackEventHandlers: (params: {
    streamId: string;
    trackId: string;
    handlers: WorkerMediaTrackEventHandlers;
  }) => void;
  stopStreamTrack: (params: { streamId: string; trackId: string }) => void;
  setStreamTrackEnabled: (params: {
    streamId: string;
    trackId: string;
    enabled: boolean;
  }) => void;
  startRecorder: (params: {
    streamId: string;
    mimeType?: string;
    timesliceMs?: number;
    handlers: WorkerMediaRecorderEventHandlers;
  }) => Promise<StartMediaRecorderResult>;
  stopRecorder: (recorderId: string) => void;
  pauseRecorder: (recorderId: string) => void;
  resumeRecorder: (recorderId: string) => void;
  requestRecorderData: (recorderId: string) => void;
  dispatchEvents: (batch: MediaSessionEventBatch) => void;
};

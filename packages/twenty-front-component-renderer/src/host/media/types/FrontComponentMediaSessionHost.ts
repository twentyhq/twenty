import {
  type MediaRecorderCapabilities,
  type MediaSessionEventBatch,
  type MediaSessionHostFunctions,
  type MediaSessionMediaType,
} from '@/types/MediaSession';

export type FrontComponentActiveMediaSession = {
  streamId: string;
  mediaTypes: MediaSessionMediaType[];
  startedAt: number;
  getLiveMediaStream: () => MediaStream | null;
};

export type MediaSessionEventTransport = {
  pushMediaSessionEvents: (batch: MediaSessionEventBatch) => Promise<void>;
};

export type MediaSessionStartVeto = {
  errorName: string;
  errorMessage: string;
};

export type CreateFrontComponentMediaSessionHostInput = {
  beforeStartStream?: (input: {
    mediaTypes: MediaSessionMediaType[];
    abortSignal: AbortSignal;
  }) => MediaSessionStartVeto | null | Promise<MediaSessionStartVeto | null>;
  onActiveSessionsChange?: (
    activeSessions: FrontComponentActiveMediaSession[],
  ) => void;
  onPendingStartChange?: (mediaTypes: MediaSessionMediaType[] | null) => void;
};

export type FrontComponentMediaSessionHost = MediaSessionHostFunctions & {
  connectEventTransport: (transport: MediaSessionEventTransport) => void;
  disconnectEventTransport: () => void;
  stopAllSessions: () => void;
  getRecorderCapabilities: () => MediaRecorderCapabilities;
};

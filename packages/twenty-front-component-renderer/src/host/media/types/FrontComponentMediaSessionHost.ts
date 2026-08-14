import {
  type MediaRecorderCapabilities,
  type MediaSessionEventBatch,
  type MediaSessionHostFunctions,
  type MediaSessionMediaType,
} from '@/types/MediaSession';

export type FrontComponentActiveMediaSession = {
  streamId: string;
  mediaType: MediaSessionMediaType;
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
  // Host page policy hook, called synchronously before any device is
  // touched: return a veto (as a DOMException name + message) to refuse the
  // capture. A null return reserves the capture slot, so overlapping starts
  // cannot both pass.
  beforeStartStream?: (
    mediaType: MediaSessionMediaType,
  ) => MediaSessionStartVeto | null;
  // Called when a start that passed beforeStartStream produced no session
  // (device failure or teardown), so the reservation can be released.
  onStartStreamFailed?: () => void;
  onActiveSessionsChange?: (
    activeSessions: FrontComponentActiveMediaSession[],
  ) => void;
};

export type FrontComponentMediaSessionHost = MediaSessionHostFunctions & {
  connectEventTransport: (transport: MediaSessionEventTransport) => void;
  disconnectEventTransport: () => void;
  stopAllSessions: () => void;
  getRecorderCapabilities: () => MediaRecorderCapabilities;
};

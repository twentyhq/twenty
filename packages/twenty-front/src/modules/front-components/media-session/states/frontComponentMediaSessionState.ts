import { type MediaSessionMediaType } from 'twenty-front-component-renderer';

import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// The one live capture session, host-wide: it drives the recording indicator
// and busy-gates concurrent getUserMedia calls across applications.
// requestStop is the indicator's stop button — it ends the device tracks,
// which the application observes as standard track ended events.
export type FrontComponentMediaSession = {
  streamId: string;
  applicationId: string;
  mediaType: MediaSessionMediaType;
  startedAt: number;
  requestStop: () => void;
  getLiveMediaStream: () => MediaStream | null;
};

export const frontComponentMediaSessionState =
  createAtomState<FrontComponentMediaSession | null>({
    key: 'frontComponentMediaSessionState',
    defaultValue: null,
  });

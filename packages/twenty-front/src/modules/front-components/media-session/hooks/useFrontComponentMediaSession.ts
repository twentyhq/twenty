import { useState } from 'react';
import {
  createFrontComponentMediaSessionHost,
  type FrontComponentMediaSessionHost,
} from 'twenty-front-component-renderer';

// Host-wide single-capture policy, reserved synchronously before any
// getUserMedia round trip. Ownership is tracked per session host so one
// host's failed or torn-down start can never release a slot another host
// holds.
let captureSlotOwnerToken: symbol | null = null;
const activeStreamIdsByHostToken = new Map<symbol, Set<string>>();

const hasAnyActiveCaptureSession = (): boolean => {
  for (const streamIds of activeStreamIdsByHostToken.values()) {
    if (streamIds.size > 0) {
      return true;
    }
  }

  return false;
};

// One capture session host per rendered front component. It owns the real
// getUserMedia and MediaRecorder objects; this hook contributes the
// one-live-capture-at-a-time policy.
export const useFrontComponentMediaSession = (): {
  mediaSessionHost: FrontComponentMediaSessionHost;
} => {
  const [mediaSessionHost] = useState(() => {
    const hostToken = Symbol('frontComponentMediaSessionHost');

    return createFrontComponentMediaSessionHost({
      beforeStartStream: () => {
        if (captureSlotOwnerToken !== null || hasAnyActiveCaptureSession()) {
          // Mirrors what a browser reports when the device is held by
          // someone else, so standard error handling code just works.
          return {
            errorName: 'NotReadableError',
            errorMessage: 'A recording is already in progress',
          };
        }

        captureSlotOwnerToken = hostToken;

        return null;
      },
      onStartStreamFailed: () => {
        if (captureSlotOwnerToken === hostToken) {
          captureSlotOwnerToken = null;
        }
      },
      onActiveSessionsChange: (activeSessions) => {
        // Any notification for this host settles its reservation: either a
        // live session carries the slot from here on, or the start produced
        // nothing and holding the slot would brick future captures. The
        // token guard keeps other hosts' notifications from touching it.
        if (captureSlotOwnerToken === hostToken) {
          captureSlotOwnerToken = null;
        }

        if (activeSessions.length === 0) {
          activeStreamIdsByHostToken.delete(hostToken);
          return;
        }

        activeStreamIdsByHostToken.set(
          hostToken,
          new Set(activeSessions.map((session) => session.streamId)),
        );
      },
    });
  });

  return { mediaSessionHost };
};

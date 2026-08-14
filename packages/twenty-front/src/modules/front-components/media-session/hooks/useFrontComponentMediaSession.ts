import { useEffect, useState } from 'react';
import {
  createFrontComponentMediaSessionHost,
  type FrontComponentMediaSessionHost,
} from 'twenty-front-component-renderer';

// Host-wide single-capture policy, reserved synchronously before any
// getUserMedia round trip: without it two components starting at the same
// time would both open devices.
let hasReservedCaptureSlot = false;
let activeCaptureStreamIds = new Set<string>();

// One capture session host per rendered front component. It owns the real
// getUserMedia and MediaRecorder objects; this hook contributes the
// one-live-capture-at-a-time policy.
export const useFrontComponentMediaSession = (): {
  mediaSessionHost: FrontComponentMediaSessionHost;
} => {
  const [mediaSessionHost] = useState(() =>
    createFrontComponentMediaSessionHost({
      beforeStartStream: () => {
        if (hasReservedCaptureSlot || activeCaptureStreamIds.size > 0) {
          // Mirrors what a browser reports when the device is held by
          // someone else, so standard error handling code just works.
          return {
            errorName: 'NotReadableError',
            errorMessage: 'A recording is already in progress',
          };
        }

        hasReservedCaptureSlot = true;

        return null;
      },
      onStartStreamFailed: () => {
        hasReservedCaptureSlot = false;
      },
      onActiveSessionsChange: (activeSessions) => {
        hasReservedCaptureSlot = false;
        activeCaptureStreamIds = new Set(
          activeSessions.map((session) => session.streamId),
        );
      },
    }),
  );

  useEffect(() => {
    return () => {
      mediaSessionHost.stopAllSessions();
    };
  }, [mediaSessionHost]);

  return { mediaSessionHost };
};

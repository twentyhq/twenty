import { useStore } from 'jotai';
import { useEffect, useState } from 'react';
import {
  createFrontComponentMediaSessionHost,
  type FrontComponentMediaSessionHost,
} from 'twenty-front-component-renderer';
import { isDefined } from 'twenty-shared/utils';

import { frontComponentMediaSessionState } from '@/front-components/media-session/states/frontComponentMediaSessionState';

// Reserves the host-wide capture slot synchronously, before any getUserMedia
// round trip: without it two components starting at the same time would both
// pass the atom check while neither session exists yet.
let hasReservedCaptureSlot = false;

// One capture session host per rendered front component. It owns the real
// getUserMedia and MediaRecorder objects, while this hook contributes the
// host-wide policy: a single live capture at a time, surfaced through the
// recording indicator with the owning application's identity.
export const useFrontComponentMediaSession = ({
  applicationId,
}: {
  applicationId: string;
}): { mediaSessionHost: FrontComponentMediaSessionHost } => {
  const store = useStore();

  const [mediaSessionHost] = useState(() => {
    let createdHost: FrontComponentMediaSessionHost | null = null;
    const ownedStreamIds = new Set<string>();

    const host = createFrontComponentMediaSessionHost({
      beforeStartStream: () => {
        const activeSession = store.get(frontComponentMediaSessionState.atom);

        if (hasReservedCaptureSlot || isDefined(activeSession)) {
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
        const currentSession = store.get(frontComponentMediaSessionState.atom);
        const [firstSession] = activeSessions;

        if (isDefined(firstSession)) {
          // The live session carries the slot from here on.
          hasReservedCaptureSlot = false;
          ownedStreamIds.add(firstSession.streamId);

          if (
            isDefined(currentSession) &&
            !ownedStreamIds.has(currentSession.streamId)
          ) {
            return;
          }

          store.set(frontComponentMediaSessionState.atom, {
            streamId: firstSession.streamId,
            applicationId,
            mediaType: firstSession.mediaType,
            startedAt: firstSession.startedAt,
            requestStop: () => createdHost?.stopAllSessions(),
            getLiveMediaStream: firstSession.getLiveMediaStream,
          });
          return;
        }

        if (
          isDefined(currentSession) &&
          ownedStreamIds.has(currentSession.streamId)
        ) {
          store.set(frontComponentMediaSessionState.atom, null);
        }
      },
    });

    createdHost = host;

    return host;
  });

  useEffect(() => {
    return () => {
      mediaSessionHost.stopAllSessions();
    };
  }, [mediaSessionHost]);

  return { mediaSessionHost };
};

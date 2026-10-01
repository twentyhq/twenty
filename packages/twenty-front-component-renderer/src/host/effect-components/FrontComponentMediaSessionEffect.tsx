import { useEffect } from 'react';

import { type FrontComponentMediaSessionHost } from '@/host/media/types/FrontComponentMediaSessionHost';
import { type FrontComponentThread } from '@/types/FrontComponentThread';

type FrontComponentMediaSessionEffectProps = {
  thread: FrontComponentThread;
  mediaSessionHost: FrontComponentMediaSessionHost;
};

export const FrontComponentMediaSessionEffect = ({
  thread,
  mediaSessionHost,
}: FrontComponentMediaSessionEffectProps) => {
  useEffect(() => {
    mediaSessionHost.connectEventTransport(thread.imports);

    return () => {
      mediaSessionHost.disconnectEventTransport();
      // The worker that could stop these devices dies with the renderer, so stop them here or they keep capturing.
      mediaSessionHost.stopAllSessions();
    };
  }, [thread, mediaSessionHost]);

  return null;
};

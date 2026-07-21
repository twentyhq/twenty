import { isFunction } from '@sniptt/guards';

import { type RemoteEventHandler } from '@/host/types/RemoteEventHandler';

// A remote handler crosses the boundary asynchronously, so its own
// preventDefault would land after the browser already acted.
export const preventDefaultThenForwardToRemote =
  (remoteHandler: unknown) => (event: { preventDefault: () => void }) => {
    event.preventDefault();

    if (isFunction(remoteHandler)) {
      (remoteHandler as RemoteEventHandler)(event);
    }
  };

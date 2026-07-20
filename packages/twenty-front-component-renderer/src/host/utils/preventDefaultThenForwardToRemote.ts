import { isFunction } from '@sniptt/guards';

import { type RemoteEventHandler } from '@/host/types/RemoteEventHandler';

// A remote handler crosses the remote-dom boundary asynchronously, so its own
// preventDefault lands after the browser already acted on the event.
export const preventDefaultThenForwardToRemote =
  (remoteHandler: unknown) => (event: { preventDefault: () => void }) => {
    event.preventDefault();

    if (isFunction(remoteHandler)) {
      (remoteHandler as RemoteEventHandler)(event);
    }
  };

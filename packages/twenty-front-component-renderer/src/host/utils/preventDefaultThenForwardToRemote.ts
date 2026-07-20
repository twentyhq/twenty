import { isFunction } from '@sniptt/guards';

import { type RemoteEventHandler } from '@/host/types/RemoteEventHandler';

// A remote handler is forwarded asynchronously across the remote-dom boundary,
// so its own preventDefault lands after the browser already acted on the event.
// The host has to prevent the default synchronously and forward afterwards.
export const preventDefaultThenForwardToRemote =
  (remoteHandler: unknown) => (event: { preventDefault: () => void }) => {
    event.preventDefault();

    // The remote prop is untrusted across the remote-dom boundary, so it may
    // not be a function.
    if (isFunction(remoteHandler)) {
      (remoteHandler as RemoteEventHandler)(event);
    }
  };

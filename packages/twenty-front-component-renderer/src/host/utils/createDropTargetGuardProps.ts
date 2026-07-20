import { isFunction } from '@sniptt/guards';

import { preventDefaultThenForwardToRemote } from '@/host/utils/preventDefaultThenForwardToRemote';

// A browser only fires drop on an element whose dragover default was prevented,
// so the host has to register both handlers as soon as the remote component
// declares either one.
export const createDropTargetGuardProps = (
  reactBindableProps: Record<string, unknown>,
): Record<string, unknown> | undefined => {
  const remoteDragOverHandler = reactBindableProps.onDragOver;
  const remoteDropHandler = reactBindableProps.onDrop;

  if (!isFunction(remoteDragOverHandler) && !isFunction(remoteDropHandler)) {
    return undefined;
  }

  return {
    onDragOver: preventDefaultThenForwardToRemote(remoteDragOverHandler),
    onDrop: preventDefaultThenForwardToRemote(remoteDropHandler),
  };
};

import { isFunction } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

type PreventableEvent = { preventDefault: () => void };

type RemoteEventHandler = (event: PreventableEvent) => void;

const asRemoteEventHandler = (value: unknown): RemoteEventHandler | undefined =>
  isFunction(value) ? (value as RemoteEventHandler) : undefined;

const preventDefaultThenForward =
  (remoteHandler?: RemoteEventHandler) => (event: PreventableEvent) => {
    event.preventDefault();
    remoteHandler?.(event);
  };

export const createDropTargetProps = (
  reactProps: Record<string, unknown>,
): Record<string, unknown> | undefined => {
  const remoteDragOverHandler = asRemoteEventHandler(reactProps.onDragOver);
  const remoteDropHandler = asRemoteEventHandler(reactProps.onDrop);

  if (!isDefined(remoteDragOverHandler) && !isDefined(remoteDropHandler)) {
    return undefined;
  }

  return {
    onDragOver: preventDefaultThenForward(remoteDragOverHandler),
    onDrop: preventDefaultThenForward(remoteDropHandler),
  };
};

import { isFunction } from '@sniptt/guards';

type PreventableEvent = { preventDefault: () => void };

type RemoteEventHandler = (event: PreventableEvent) => void;

const asRemoteEventHandler = (value: unknown): RemoteEventHandler | undefined =>
  isFunction(value) ? (value as RemoteEventHandler) : undefined;

export const createDropTargetProps = (
  reactProps: Record<string, unknown>,
): Record<string, unknown> | undefined => {
  const remoteDragOverHandler = asRemoteEventHandler(reactProps.onDragOver);
  const remoteDropHandler = asRemoteEventHandler(reactProps.onDrop);

  const isDropTarget =
    remoteDragOverHandler !== undefined || remoteDropHandler !== undefined;

  if (!isDropTarget) {
    return undefined;
  }

  return {
    onDragOver: (dragOverEvent: PreventableEvent) => {
      dragOverEvent.preventDefault();
      remoteDragOverHandler?.(dragOverEvent);
    },
    onDrop: (dropEvent: PreventableEvent) => {
      dropEvent.preventDefault();
      remoteDropHandler?.(dropEvent);
    },
  };
};

import { isFunction } from '@sniptt/guards';

type PreventableEvent = { preventDefault: () => void };

export const createDropTargetProps = (
  reactProps: Record<string, unknown>,
): Record<string, unknown> | undefined => {
  const remoteOnDragOver = reactProps.onDragOver;
  const remoteOnDrop = reactProps.onDrop;

  if (!isFunction(remoteOnDragOver) && !isFunction(remoteOnDrop)) {
    return undefined;
  }

  return {
    onDragOver: (event: PreventableEvent) => {
      event.preventDefault();
      if (isFunction(remoteOnDragOver)) {
        (remoteOnDragOver as (event: PreventableEvent) => void)(event);
      }
    },
    onDrop: (event: PreventableEvent) => {
      event.preventDefault();
      if (isFunction(remoteOnDrop)) {
        (remoteOnDrop as (event: PreventableEvent) => void)(event);
      }
    },
  };
};

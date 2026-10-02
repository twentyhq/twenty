import { REMOTE_ELEMENT_PROP } from '@remote-dom/react/host';
import { isFunction, isObject } from '@sniptt/guards';

type RemoteElementEventListenersCarrier = {
  [REMOTE_ELEMENT_PROP]?: { eventListeners?: unknown };
};

export const isRemoteEventListenerActive = ({
  remoteProps,
  domEventType,
}: {
  remoteProps: Record<string, unknown>;
  domEventType: string;
}): boolean => {
  const remoteEventListeners = (
    remoteProps as RemoteElementEventListenersCarrier
  )[REMOTE_ELEMENT_PROP]?.eventListeners;

  if (!isObject(remoteEventListeners)) {
    return true;
  }

  return isFunction(Reflect.get(remoteEventListeners, domEventType));
};

import { REMOTE_ELEMENT_PROP } from '@remote-dom/react/host';
import { isFunction, isObject } from '@sniptt/guards';

export const isRemoteEventListenerActive = ({
  remoteProps,
  domEventType,
}: {
  remoteProps: Record<string, unknown>;
  domEventType: string;
}): boolean => {
  const remoteElement: unknown = Reflect.get(remoteProps, REMOTE_ELEMENT_PROP);

  if (!isObject(remoteElement)) {
    return true;
  }

  const remoteEventListeners: unknown = Reflect.get(
    remoteElement,
    'eventListeners',
  );

  if (!isObject(remoteEventListeners)) {
    return true;
  }

  return isFunction(Reflect.get(remoteEventListeners, domEventType));
};

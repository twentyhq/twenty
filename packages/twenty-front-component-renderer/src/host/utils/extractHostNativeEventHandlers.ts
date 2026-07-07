import { isFunction } from '@sniptt/guards';

import { HOST_NATIVE_EVENT_PROP_TO_EVENT_TYPE } from '@/host/constants/HostNativeEventPropToEventType';
import { type HostNativeEventHandlers } from '@/host/types/HostNativeEventHandlers';

export const extractHostNativeEventHandlers = (
  reactProps: Record<string, unknown>,
): {
  nativeEventHandlers: HostNativeEventHandlers;
  remainingProps: Record<string, unknown>;
} => {
  const nativeEventHandlers: HostNativeEventHandlers = {};
  const remainingProps = { ...reactProps };

  for (const [reactPropName, nativeEventType] of Object.entries(
    HOST_NATIVE_EVENT_PROP_TO_EVENT_TYPE,
  )) {
    const handler = remainingProps[reactPropName];
    delete remainingProps[reactPropName];

    if (isFunction(handler)) {
      nativeEventHandlers[nativeEventType] = handler as (event: Event) => void;
    }
  }

  return { nativeEventHandlers, remainingProps };
};

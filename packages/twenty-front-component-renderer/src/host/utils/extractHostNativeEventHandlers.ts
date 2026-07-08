import { isFunction } from '@sniptt/guards';

import { HOST_NATIVE_EVENT_PROP_TO_EVENT_TYPE } from '@/host/constants/HostNativeEventPropToEventType';
import { type HostNativeEventHandlers } from '@/host/types/HostNativeEventHandlers';

const HOST_NATIVE_EVENT_PROP_ENTRIES = Object.entries(
  HOST_NATIVE_EVENT_PROP_TO_EVENT_TYPE,
);

const EMPTY_HOST_NATIVE_EVENT_HANDLERS: HostNativeEventHandlers = {};

export const extractHostNativeEventHandlers = (
  reactProps: Record<string, unknown>,
): {
  nativeEventHandlers: HostNativeEventHandlers;
  remainingProps: Record<string, unknown>;
} => {
  let hasNativeEventProp = false;
  for (const [reactPropName] of HOST_NATIVE_EVENT_PROP_ENTRIES) {
    if (reactPropName in reactProps) {
      hasNativeEventProp = true;
      break;
    }
  }

  if (!hasNativeEventProp) {
    return {
      nativeEventHandlers: EMPTY_HOST_NATIVE_EVENT_HANDLERS,
      remainingProps: reactProps,
    };
  }

  const nativeEventHandlers: HostNativeEventHandlers = {};
  const remainingProps = { ...reactProps };

  for (const [
    reactPropName,
    nativeEventType,
  ] of HOST_NATIVE_EVENT_PROP_ENTRIES) {
    const handler = remainingProps[reactPropName];
    delete remainingProps[reactPropName];

    if (isFunction(handler)) {
      nativeEventHandlers[nativeEventType] = handler as (event: Event) => void;
    }
  }

  return { nativeEventHandlers, remainingProps };
};

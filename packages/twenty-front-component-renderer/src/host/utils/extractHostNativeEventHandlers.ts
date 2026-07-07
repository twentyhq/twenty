import { isFunction } from '@sniptt/guards';

import { HOST_NATIVE_ONLY_EVENT_PROPS } from '@/host/constants/HostNativeOnlyEventProps';

type HostNativeEventType =
  (typeof HOST_NATIVE_ONLY_EVENT_PROPS)[keyof typeof HOST_NATIVE_ONLY_EVENT_PROPS];

export const extractHostNativeEventHandlers = (
  reactProps: Record<string, unknown>,
): {
  nativeEventHandlers: Partial<
    Record<HostNativeEventType, (event: Event) => void>
  >;
  remainingProps: Record<string, unknown>;
} => {
  const nativeEventHandlers: Partial<
    Record<HostNativeEventType, (event: Event) => void>
  > = {};
  const remainingProps: Record<string, unknown> = { ...reactProps };

  for (const [propName, eventType] of Object.entries(
    HOST_NATIVE_ONLY_EVENT_PROPS,
  )) {
    const handler = remainingProps[propName];
    delete remainingProps[propName];

    if (isFunction(handler)) {
      nativeEventHandlers[eventType] = handler as (event: Event) => void;
    }
  }

  return { nativeEventHandlers, remainingProps };
};

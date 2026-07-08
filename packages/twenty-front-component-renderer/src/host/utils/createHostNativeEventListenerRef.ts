import { isDefined } from 'twenty-shared/utils';

import { HOST_NATIVE_EVENT_PROP_TO_EVENT_TYPE } from '@/host/constants/HostNativeEventPropToEventType';
import { type HostNativeEventHandlers } from '@/host/types/HostNativeEventHandlers';
import { type HostNativeEventType } from '@/host/types/HostNativeEventType';

const HOST_NATIVE_EVENT_TYPES = Object.values(
  HOST_NATIVE_EVENT_PROP_TO_EVENT_TYPE,
);

export const createHostNativeEventListenerRef = (latestHandlersRef: {
  current: HostNativeEventHandlers;
}) => {
  let attachedElement: Element | null = null;

  const forwardEventToLatestHandler = (event: Event) => {
    const latestHandler =
      latestHandlersRef.current[event.type as HostNativeEventType];
    latestHandler?.(event);
  };

  return (element: Element | null) => {
    if (isDefined(attachedElement)) {
      for (const eventType of HOST_NATIVE_EVENT_TYPES) {
        attachedElement.removeEventListener(
          eventType,
          forwardEventToLatestHandler,
        );
      }
    }

    attachedElement = element;

    if (isDefined(element)) {
      for (const eventType of HOST_NATIVE_EVENT_TYPES) {
        element.addEventListener(eventType, forwardEventToLatestHandler);
      }
    }
  };
};

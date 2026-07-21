import { type RefObject } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { REACT_UNSUPPORTED_EVENT_PROP_TO_EVENT_TYPE } from '@/host/constants/ReactUnsupportedEventPropToEventType';
import { type ReactUnsupportedEventHandlers } from '@/host/types/ReactUnsupportedEventHandlers';
import { type ReactUnsupportedEventType } from '@/host/types/ReactUnsupportedEventType';

const REACT_UNSUPPORTED_EVENT_TYPES = Object.values(
  REACT_UNSUPPORTED_EVENT_PROP_TO_EVENT_TYPE,
);

export const createReactUnsupportedEventListenerRef = (
  latestHandlersRef: RefObject<ReactUnsupportedEventHandlers>,
) => {
  let attachedElement: Element | null = null;

  const forwardEventToLatestHandler = (event: Event) => {
    const latestHandler =
      latestHandlersRef.current[event.type as ReactUnsupportedEventType];
    latestHandler?.(event);
  };

  return (element: Element | null) => {
    if (isDefined(attachedElement)) {
      for (const eventType of REACT_UNSUPPORTED_EVENT_TYPES) {
        attachedElement.removeEventListener(
          eventType,
          forwardEventToLatestHandler,
        );
      }
    }

    attachedElement = element;

    if (isDefined(element)) {
      for (const eventType of REACT_UNSUPPORTED_EVENT_TYPES) {
        element.addEventListener(eventType, forwardEventToLatestHandler);
      }
    }
  };
};

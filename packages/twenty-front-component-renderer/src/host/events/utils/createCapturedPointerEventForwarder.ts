import { applyEventModifierKeys } from '@/host/events/utils/applyEventModifierKeys';
import { applyMouseEventProperties } from '@/host/events/utils/applyMouseEventProperties';
import { applyPointerEventProperties } from '@/host/events/utils/applyPointerEventProperties';
import { forwardCapturedPointerEventOnce } from '@/host/events/utils/forwardCapturedPointerEventOnce';
import { type FindRemoteElementIdContainingNode } from '@/host/geometry/types/FindRemoteElementIdContainingNode';
import { type SerializedEventData } from '@/types/SerializedEventData';

const CAPTURED_POINTER_EVENT_TYPES = [
  'pointermove',
  'pointerup',
  'pointercancel',
] as const;

const serializeCapturedPointerEvent = (
  event: PointerEvent,
): SerializedEventData => {
  const serializedEvent: SerializedEventData = {
    type: event.type,
    bubbles: true,
  };

  applyEventModifierKeys({ serializedEvent, domEvent: event });
  applyMouseEventProperties({ serializedEvent, domEvent: event });
  applyPointerEventProperties({ serializedEvent, domEvent: event });

  return serializedEvent;
};

export const createCapturedPointerEventForwarder = ({
  element,
  pointerId,
  forwardEvent,
  onEnd,
  eventOwner,
}: {
  element: HTMLElement;
  pointerId: number;
  forwardEvent: (eventData: SerializedEventData) => void;
  onEnd: () => void;
  eventOwner: FindRemoteElementIdContainingNode;
}): (() => void) => {
  const documentTarget = element.ownerDocument;
  let hasEnded = false;

  const end = () => {
    if (hasEnded) {
      return;
    }

    hasEnded = true;
    for (const eventType of CAPTURED_POINTER_EVENT_TYPES) {
      documentTarget.removeEventListener(eventType, handlePointerEvent);
    }
    element.removeEventListener('lostpointercapture', handleCaptureLoss);
    detachmentObserver.disconnect();
    onEnd();
  };

  const handlePointerEvent = (event: PointerEvent) => {
    if (!event.isTrusted || event.pointerId !== pointerId) {
      return;
    }

    if (!element.isConnected) {
      end();
      return;
    }

    forwardCapturedPointerEventOnce({
      nativeHostEvent: event,
      eventOwner,
      forwardEvent: () => forwardEvent(serializeCapturedPointerEvent(event)),
    });

    if (event.type === 'pointerup' || event.type === 'pointercancel') {
      end();
    }
  };

  const handleCaptureLoss = (event: PointerEvent) => {
    if (!event.isTrusted || event.pointerId !== pointerId) {
      return;
    }

    forwardEvent(serializeCapturedPointerEvent(event));
  };

  const detachmentObserver = new MutationObserver(() => {
    if (!element.isConnected) {
      end();
    }
  });

  for (const eventType of CAPTURED_POINTER_EVENT_TYPES) {
    documentTarget.addEventListener(eventType, handlePointerEvent);
  }
  element.addEventListener('lostpointercapture', handleCaptureLoss);
  detachmentObserver.observe(documentTarget, {
    childList: true,
    subtree: true,
  });

  return end;
};

import { CAPTURED_POINTER_EVENT_TYPES } from '@/constants/CapturedPointerEventTypes';
import { POINTER_GESTURE_END_EVENT_TYPES } from '@/constants/PointerGestureEndEventTypes';
import { type ClaimPointerEventForwarding } from '@/host/events/types/ClaimPointerEventForwarding';
import { applyEventModifierKeys } from '@/host/events/utils/applyEventModifierKeys';
import { applyMouseEventProperties } from '@/host/events/utils/applyMouseEventProperties';
import { applyPointerEventProperties } from '@/host/events/utils/applyPointerEventProperties';
import { type SerializedEventData } from '@/types/SerializedEventData';

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
  claimPointerEventForwarding,
  forwardEvent,
  onEnd,
}: {
  element: HTMLElement;
  pointerId: number;
  claimPointerEventForwarding: ClaimPointerEventForwarding;
  forwardEvent: (eventData: SerializedEventData) => void;
  onEnd: () => void;
}): (() => void) => {
  const documentTarget = element.ownerDocument;
  let hasEnded = false;

  const end = () => {
    if (hasEnded) {
      return;
    }

    hasEnded = true;
    for (const eventType of CAPTURED_POINTER_EVENT_TYPES) {
      element.removeEventListener(eventType, handleCapturingElementEvent);
      documentTarget.removeEventListener(eventType, handlePointerEvent);
    }
    element.removeEventListener('lostpointercapture', handleCaptureLoss);
    onEnd();
  };

  const handlePointerEvent = (event: PointerEvent) => {
    if (hasEnded || !event.isTrusted || event.pointerId !== pointerId) {
      return;
    }

    if (!element.isConnected) {
      end();
      return;
    }

    if (claimPointerEventForwarding(event)) {
      forwardEvent(serializeCapturedPointerEvent(event));
    }

    if (!POINTER_GESTURE_END_EVENT_TYPES.has(event.type)) {
      return;
    }

    if (element.hasPointerCapture(pointerId)) {
      forwardEvent({
        ...serializeCapturedPointerEvent(event),
        type: 'lostpointercapture',
      });
    }

    end();
  };

  const handleCapturingElementEvent = (event: PointerEvent) => {
    if (event.target === element) {
      handlePointerEvent(event);
    }
  };

  const handleCaptureLoss = (event: PointerEvent) => {
    if (!event.isTrusted || event.pointerId !== pointerId) {
      return;
    }

    forwardEvent(serializeCapturedPointerEvent(event));
  };

  for (const eventType of CAPTURED_POINTER_EVENT_TYPES) {
    element.addEventListener(eventType, handleCapturingElementEvent);
    documentTarget.addEventListener(eventType, handlePointerEvent);
  }
  element.addEventListener('lostpointercapture', handleCaptureLoss);

  return end;
};

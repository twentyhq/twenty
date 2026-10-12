import { release, retain } from '@quilted/threads';

import { type RemoteSerializedEventListener } from '@/host/events/types/RemoteSerializedEventListener';
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

export const createCapturedPointerEventForwarder = ({
  element,
  pointerId,
  forwardEvent,
  onDispose,
  eventOwner,
}: {
  element: Element;
  pointerId: number;
  forwardEvent: RemoteSerializedEventListener;
  onDispose: () => void;
  eventOwner: FindRemoteElementIdContainingNode;
}): (() => void) => {
  const documentTarget = element.ownerDocument;
  let isDisposed = false;

  const dispose = () => {
    if (isDisposed) {
      return;
    }

    isDisposed = true;
    for (const eventType of CAPTURED_POINTER_EVENT_TYPES) {
      documentTarget.removeEventListener(eventType, handlePointerEvent);
    }
    detachmentObserver.disconnect();
    release(forwardEvent);
    onDispose();
  };

  const handlePointerEvent = (event: PointerEvent) => {
    if (!event.isTrusted || event.pointerId !== pointerId) {
      return;
    }

    if (!element.isConnected) {
      dispose();
      return;
    }

    const isGestureEnd =
      event.type === 'pointerup' || event.type === 'pointercancel';
    const isTargetInsideCapturedElement =
      event.target instanceof Node && element.contains(event.target);

    if (!isTargetInsideCapturedElement) {
      const serializedEvent: SerializedEventData = {
        type: event.type,
        bubbles: true,
      };
      const domEvent = event as unknown as Record<string, unknown>;

      applyEventModifierKeys({ serializedEvent, domEvent });
      applyMouseEventProperties({ serializedEvent, domEvent });
      applyPointerEventProperties({ serializedEvent, domEvent });
      forwardCapturedPointerEventOnce({
        nativeHostEvent: event,
        eventOwner,
        forwardEvent: () => forwardEvent(serializedEvent),
      });
    }

    if (isGestureEnd) {
      dispose();
    }
  };

  const detachmentObserver = new MutationObserver(() => {
    if (!element.isConnected) {
      dispose();
    }
  });

  retain(forwardEvent);
  for (const eventType of CAPTURED_POINTER_EVENT_TYPES) {
    documentTarget.addEventListener(eventType, handlePointerEvent);
  }
  detachmentObserver.observe(documentTarget, {
    childList: true,
    subtree: true,
  });

  return dispose;
};

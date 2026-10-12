import { callRemoteElementMethod, remoteId } from '@remote-dom/core/elements';
import { isInteger } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { findElementByRemoteId } from '@/polyfills/dom/utils/findElementByRemoteId';
import { isElementNode } from '@/polyfills/dom/utils/isElementNode';
import { type WorkerPointerCapture } from '@/polyfills/events/types/WorkerPointerCapture';
import { isElementUnderRemoteRoot } from '@/polyfills/geometry/utils/isElementUnderRemoteRoot';
import { definePolyfillMethod } from '@/polyfills/utils/definePolyfillMethod';
import { createWorkerEventFromSerializedEvent } from '@/remote/elements/utils/createWorkerEventFromSerializedEvent';
import { type CapturedPointerEventUpdate } from '@/types/CapturedPointerEventUpdate';
import { type PointerCaptureRequest } from '@/types/PointerCaptureRequest';

const POINTER_GESTURE_END_EVENT_TYPES = ['pointerup', 'pointercancel'] as const;

const CAPTURED_POINTER_EVENT_TYPES: ReadonlySet<string> = new Set([
  'pointermove',
  'pointerup',
  'pointercancel',
  'lostpointercapture',
]);

type CapturedPointer = {
  pointerId: number;
  captureToken: number;
  removeListeners: () => void;
};

const hasPointerId = ({
  event,
  pointerId,
}: {
  event: Event;
  pointerId: number;
}): boolean => Reflect.get(event, 'pointerId') === pointerId;

export const installPointerCapturePolyfill = ({
  elementPrototype,
  documentTarget,
}: {
  elementPrototype: object;
  documentTarget: Document;
}): WorkerPointerCapture => {
  const capturedPointers = new Map<Element, CapturedPointer>();
  let lastCaptureToken = 0;
  let hasScheduledDetachedCaptureSweep = false;

  const clearCapture = (element: Element) => {
    const capture = capturedPointers.get(element);

    if (!isDefined(capture)) {
      return;
    }

    capturedPointers.delete(element);
    capture.removeListeners();
  };

  const clearCaptureWhenCurrent = ({
    element,
    captureToken,
  }: {
    element: Element;
    captureToken: number;
  }) => {
    if (capturedPointers.get(element)?.captureToken === captureToken) {
      clearCapture(element);
    }
  };

  const setPointerCapture = (element: Element, pointerId: unknown) => {
    if (
      !isInteger(pointerId) ||
      !isElementUnderRemoteRoot(element, documentTarget.body) ||
      capturedPointers.get(element)?.pointerId === pointerId
    ) {
      return;
    }

    clearCapture(element);
    lastCaptureToken += 1;
    const captureToken = lastCaptureToken;

    const clearCaptureAfterGestureEnd = (event: Event) => {
      if (hasPointerId({ event, pointerId })) {
        queueMicrotask(() =>
          clearCaptureWhenCurrent({ element, captureToken }),
        );
      }
    };
    const clearCaptureOnLoss = (event: Event) => {
      if (hasPointerId({ event, pointerId })) {
        clearCaptureWhenCurrent({ element, captureToken });
      }
    };

    for (const eventType of POINTER_GESTURE_END_EVENT_TYPES) {
      documentTarget.addEventListener(eventType, clearCaptureAfterGestureEnd);
    }
    element.addEventListener('lostpointercapture', clearCaptureOnLoss);

    capturedPointers.set(element, {
      pointerId,
      captureToken,
      removeListeners: () => {
        for (const eventType of POINTER_GESTURE_END_EVENT_TYPES) {
          documentTarget.removeEventListener(
            eventType,
            clearCaptureAfterGestureEnd,
          );
        }
        element.removeEventListener('lostpointercapture', clearCaptureOnLoss);
      },
    });
    callRemoteElementMethod(
      element,
      'setPointerCapture',
      pointerId,
      captureToken,
    );
  };

  const releasePointerCapture = (element: Element, pointerId: unknown) => {
    const capture = capturedPointers.get(element);

    if (!isDefined(capture) || capture.pointerId !== pointerId) {
      return;
    }

    clearCapture(element);

    if (isElementUnderRemoteRoot(element, documentTarget.body)) {
      callRemoteElementMethod(
        element,
        'releasePointerCapture',
        capture.pointerId,
        capture.captureToken,
      );
    }
  };

  definePolyfillMethod<Element>({
    target: elementPrototype,
    methodName: 'setPointerCapture',
    method: (element, pointerId) => setPointerCapture(element, pointerId),
  });
  definePolyfillMethod<Element>({
    target: elementPrototype,
    methodName: 'releasePointerCapture',
    method: (element, pointerId) => releasePointerCapture(element, pointerId),
  });
  definePolyfillMethod<Element>({
    target: elementPrototype,
    methodName: 'hasPointerCapture',
    method: (element, pointerId) =>
      capturedPointers.get(element)?.pointerId === pointerId,
  });

  const findCapturedPointerTarget = (
    remoteElementId: string,
  ): Element | null => {
    for (const element of capturedPointers.keys()) {
      if (remoteId(element) === remoteElementId) {
        return element;
      }
    }

    const element = findElementByRemoteId({
      rootNode: documentTarget.body,
      remoteElementId,
    });

    return isElementNode(element) ? element : null;
  };

  const sweepDetachedCaptures = () => {
    hasScheduledDetachedCaptureSweep = false;

    for (const element of [...capturedPointers.keys()]) {
      if (!isElementUnderRemoteRoot(element, documentTarget.body)) {
        clearCapture(element);
      }
    }
  };

  return {
    dispatchCapturedPointerEvent: ({
      remoteElementId,
      eventData,
    }: CapturedPointerEventUpdate) => {
      if (!CAPTURED_POINTER_EVENT_TYPES.has(eventData.type)) {
        return;
      }

      const element = findCapturedPointerTarget(remoteElementId);

      if (!isDefined(element) || !element.isConnected) {
        return;
      }

      element.dispatchEvent(
        createWorkerEventFromSerializedEvent({
          listeningElement: element,
          eventType: eventData.type,
          eventData,
        }),
      );
    },
    refusePointerCapture: ({
      pointerId,
      captureToken,
    }: PointerCaptureRequest) => {
      for (const [element, capture] of capturedPointers) {
        if (
          capture.pointerId === pointerId &&
          capture.captureToken === captureToken
        ) {
          clearCapture(element);
          return;
        }
      }
    },
    scheduleDetachedCaptureSweep: () => {
      if (hasScheduledDetachedCaptureSweep || capturedPointers.size === 0) {
        return;
      }

      hasScheduledDetachedCaptureSweep = true;
      queueMicrotask(sweepDetachedCaptures);
    },
  };
};

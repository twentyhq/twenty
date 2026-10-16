import { callRemoteElementMethod, remoteId } from '@remote-dom/core/elements';
import { isInteger } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { CAPTURED_POINTER_EVENT_TYPES } from '@/constants/CapturedPointerEventTypes';
import { POINTER_GESTURE_END_EVENT_TYPES } from '@/constants/PointerGestureEndEventTypes';
import { findElementByRemoteId } from '@/polyfills/dom/utils/findElementByRemoteId';
import { isElementNode } from '@/polyfills/dom/utils/isElementNode';
import { type WorkerPointerCapture } from '@/polyfills/events/types/WorkerPointerCapture';
import { isElementUnderRemoteRoot } from '@/polyfills/geometry/utils/isElementUnderRemoteRoot';
import { definePolyfillMethod } from '@/polyfills/utils/definePolyfillMethod';
import { createWorkerEventFromSerializedEvent } from '@/remote/elements/utils/createWorkerEventFromSerializedEvent';
import { type CapturedPointerEventUpdate } from '@/types/CapturedPointerEventUpdate';
import { type PointerCaptureRequest } from '@/types/PointerCaptureRequest';

const DISPATCHABLE_POINTER_EVENT_TYPES: ReadonlySet<string> = new Set([
  ...CAPTURED_POINTER_EVENT_TYPES,
  'lostpointercapture',
]);

type CapturedPointer = {
  captureToken: number;
  removeListeners: () => void;
};

type ElementPointer = {
  element: Element;
  pointerId: number;
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
  const capturedPointersByElement = new Map<
    Element,
    Map<number, CapturedPointer>
  >();
  let lastCaptureToken = 0;
  let hasScheduledDetachedCaptureSweep = false;
  let gesturePointerTarget: Element | null = null;

  const findCapture = ({
    element,
    pointerId,
  }: ElementPointer): CapturedPointer | undefined =>
    capturedPointersByElement.get(element)?.get(pointerId);

  const clearCapture = ({ element, pointerId }: ElementPointer) => {
    const elementCaptures = capturedPointersByElement.get(element);
    const capture = elementCaptures?.get(pointerId);

    if (!isDefined(elementCaptures) || !isDefined(capture)) {
      return;
    }

    elementCaptures.delete(pointerId);
    capture.removeListeners();

    if (elementCaptures.size === 0) {
      capturedPointersByElement.delete(element);
    }
  };

  const clearElementCaptures = (element: Element) => {
    for (const pointerId of [
      ...(capturedPointersByElement.get(element)?.keys() ?? []),
    ]) {
      clearCapture({ element, pointerId });
    }
  };

  const clearCaptureWhenCurrent = ({
    element,
    pointerId,
    captureToken,
  }: ElementPointer & { captureToken: number }) => {
    if (findCapture({ element, pointerId })?.captureToken === captureToken) {
      clearCapture({ element, pointerId });
    }
  };

  const setPointerCapture = (element: Element, pointerId: unknown) => {
    if (
      !isInteger(pointerId) ||
      !isElementUnderRemoteRoot(element, documentTarget.body) ||
      isDefined(findCapture({ element, pointerId }))
    ) {
      return;
    }

    lastCaptureToken += 1;
    const captureToken = lastCaptureToken;

    const clearCaptureAfterGestureEnd = (event: Event) => {
      if (hasPointerId({ event, pointerId })) {
        queueMicrotask(() =>
          clearCaptureWhenCurrent({ element, pointerId, captureToken }),
        );
      }
    };
    const clearCaptureOnLoss = (event: Event) => {
      if (hasPointerId({ event, pointerId })) {
        clearCaptureWhenCurrent({ element, pointerId, captureToken });
      }
    };

    for (const eventType of POINTER_GESTURE_END_EVENT_TYPES) {
      documentTarget.addEventListener(eventType, clearCaptureAfterGestureEnd, {
        capture: true,
      });
    }
    element.addEventListener('lostpointercapture', clearCaptureOnLoss);

    const elementCaptures =
      capturedPointersByElement.get(element) ??
      new Map<number, CapturedPointer>();

    elementCaptures.set(pointerId, {
      captureToken,
      removeListeners: () => {
        for (const eventType of POINTER_GESTURE_END_EVENT_TYPES) {
          documentTarget.removeEventListener(
            eventType,
            clearCaptureAfterGestureEnd,
            { capture: true },
          );
        }
        element.removeEventListener('lostpointercapture', clearCaptureOnLoss);
      },
    });
    capturedPointersByElement.set(element, elementCaptures);
    callRemoteElementMethod(
      element,
      'setPointerCapture',
      pointerId,
      captureToken,
    );
  };

  const releasePointerCapture = (element: Element, pointerId: unknown) => {
    if (!isInteger(pointerId)) {
      return;
    }

    const capture = findCapture({ element, pointerId });

    if (!isDefined(capture)) {
      return;
    }

    clearCapture({ element, pointerId });

    if (isElementUnderRemoteRoot(element, documentTarget.body)) {
      callRemoteElementMethod(
        element,
        'releasePointerCapture',
        pointerId,
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
      isInteger(pointerId) && isDefined(findCapture({ element, pointerId })),
  });

  const findCapturedPointerTarget = (
    remoteElementId: string,
  ): Element | null => {
    for (const element of capturedPointersByElement.keys()) {
      if (remoteId(element) === remoteElementId) {
        return element;
      }
    }

    if (
      isDefined(gesturePointerTarget) &&
      gesturePointerTarget.isConnected &&
      remoteId(gesturePointerTarget) === remoteElementId
    ) {
      return gesturePointerTarget;
    }

    const element = findElementByRemoteId({
      rootNode: documentTarget.body,
      remoteElementId,
    });
    gesturePointerTarget = isElementNode(element) ? element : null;

    return gesturePointerTarget;
  };

  const sweepDetachedCaptures = () => {
    hasScheduledDetachedCaptureSweep = false;

    for (const element of [...capturedPointersByElement.keys()]) {
      if (!isElementUnderRemoteRoot(element, documentTarget.body)) {
        clearElementCaptures(element);
      }
    }
  };

  return {
    dispatchCapturedPointerEvent: ({
      remoteElementId,
      eventData,
    }: CapturedPointerEventUpdate) => {
      if (!DISPATCHABLE_POINTER_EVENT_TYPES.has(eventData.type)) {
        return;
      }

      const element = findCapturedPointerTarget(remoteElementId);

      if (POINTER_GESTURE_END_EVENT_TYPES.has(eventData.type)) {
        gesturePointerTarget = null;
      }

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
      for (const element of capturedPointersByElement.keys()) {
        if (
          findCapture({ element, pointerId })?.captureToken === captureToken
        ) {
          clearCapture({ element, pointerId });
          return;
        }
      }
    },
    scheduleDetachedCaptureSweep: () => {
      if (
        hasScheduledDetachedCaptureSweep ||
        capturedPointersByElement.size === 0
      ) {
        return;
      }

      hasScheduledDetachedCaptureSweep = true;
      queueMicrotask(sweepDetachedCaptures);
    },
  };
};

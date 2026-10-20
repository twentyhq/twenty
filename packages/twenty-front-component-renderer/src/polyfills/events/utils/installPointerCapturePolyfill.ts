import { remoteId } from '@remote-dom/core/elements';
import { isInteger } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { POINTER_GESTURE_END_EVENT_TYPES } from '@/constants/PointerGestureEndEventTypes';
import { findElementByRemoteId } from '@/polyfills/dom/utils/findElementByRemoteId';
import { isElementNode } from '@/polyfills/dom/utils/isElementNode';
import { type WorkerPointerCapture } from '@/polyfills/events/types/WorkerPointerCapture';
import { isElementUnderRemoteRoot } from '@/polyfills/geometry/utils/isElementUnderRemoteRoot';
import { definePolyfillMethod } from '@/polyfills/utils/definePolyfillMethod';
import { createWorkerEventFromSerializedEvent } from '@/remote/elements/utils/createWorkerEventFromSerializedEvent';
import { type CapturedPointerEventUpdate } from '@/types/CapturedPointerEventUpdate';

export const installPointerCapturePolyfill = ({
  elementPrototype,
  documentTarget,
}: {
  elementPrototype: object;
  documentTarget: Document;
}): WorkerPointerCapture => {
  const capturingElementByPointerId = new Map<number, Element>();
  let gesturePointerTarget: Element | null = null;
  let hasScheduledDetachedCaptureSweep = false;

  const sweepDetachedCaptures = () => {
    hasScheduledDetachedCaptureSweep = false;

    for (const [pointerId, element] of capturingElementByPointerId) {
      if (!isElementUnderRemoteRoot(element, documentTarget.body)) {
        capturingElementByPointerId.delete(pointerId);
      }
    }
  };

  const releasePointerCapture = ({
    element,
    pointerId,
  }: {
    element: Element;
    pointerId: number;
  }) => {
    if (capturingElementByPointerId.get(pointerId) === element) {
      capturingElementByPointerId.delete(pointerId);
    }
  };

  definePolyfillMethod<Element>({
    target: elementPrototype,
    methodName: 'setPointerCapture',
    method: (element, pointerId) => {
      if (
        isInteger(pointerId) &&
        isElementUnderRemoteRoot(element, documentTarget.body)
      ) {
        capturingElementByPointerId.set(pointerId, element);
      }
    },
  });
  definePolyfillMethod<Element>({
    target: elementPrototype,
    methodName: 'releasePointerCapture',
    method: (element, pointerId) => {
      if (isInteger(pointerId)) {
        releasePointerCapture({ element, pointerId });
      }
    },
  });
  definePolyfillMethod<Element>({
    target: elementPrototype,
    methodName: 'hasPointerCapture',
    method: (element, pointerId) =>
      isInteger(pointerId) &&
      capturingElementByPointerId.get(pointerId) === element &&
      isElementUnderRemoteRoot(element, documentTarget.body),
  });

  const findGesturePointerTarget = (
    remoteElementId: string,
  ): Element | null => {
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

  return {
    dispatchCapturedPointerEvent: ({
      remoteElementId,
      eventData,
    }: CapturedPointerEventUpdate) => {
      const element = findGesturePointerTarget(remoteElementId);

      if (POINTER_GESTURE_END_EVENT_TYPES.has(eventData.type)) {
        gesturePointerTarget = null;
      }

      if (!isDefined(element)) {
        return;
      }

      if (
        eventData.type === 'lostpointercapture' &&
        isDefined(eventData.pointerId)
      ) {
        releasePointerCapture({ element, pointerId: eventData.pointerId });
      }

      element.dispatchEvent(
        createWorkerEventFromSerializedEvent({
          listeningElement: element,
          eventType: eventData.type,
          eventData,
        }),
      );
    },
    scheduleDetachedCaptureSweep: () => {
      if (
        hasScheduledDetachedCaptureSweep ||
        capturingElementByPointerId.size === 0
      ) {
        return;
      }

      hasScheduledDetachedCaptureSweep = true;
      queueMicrotask(sweepDetachedCaptures);
    },
  };
};

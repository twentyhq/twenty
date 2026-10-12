import { callRemoteElementMethod } from '@remote-dom/core/elements';
import { isInteger } from '@sniptt/guards';

import { createWorkerEventFromSerializedEvent } from '@/remote/elements/utils/createWorkerEventFromSerializedEvent';
import { type SerializedEventData } from '@/types/SerializedEventData';
import { isDefined } from 'twenty-shared/utils';

import { type WorkerGeometryStore } from '@/polyfills/geometry/types/WorkerGeometryStore';
import { isElementUnderRemoteRoot } from '@/polyfills/geometry/utils/isElementUnderRemoteRoot';

const POINTER_GESTURE_END_EVENT_TYPES = ['pointerup', 'pointercancel'] as const;

const CAPTURED_POINTER_EVENT_TYPES = [
  'pointermove',
  'pointerup',
  'pointercancel',
  'lostpointercapture',
] as const;

type CapturedPointer = {
  pointerId: number;
  isCaptured: boolean;
  removeListeners: () => void;
};

export const installPointerCapturePolyfill = ({
  elementPrototype,
  documentTarget,
  geometryStore,
}: {
  elementPrototype: object;
  documentTarget: Document;
  geometryStore: WorkerGeometryStore;
}): void => {
  const capturedPointers = new Map<Element, CapturedPointer>();

  const clearCapture = (element: Element) => {
    const capture = capturedPointers.get(element);

    if (!isDefined(capture)) {
      return;
    }

    capturedPointers.delete(element);
    capture.removeListeners();
  };

  Object.defineProperties(elementPrototype, {
    setPointerCapture: {
      configurable: true,
      value(this: Element, pointerId: number) {
        if (
          !isInteger(pointerId) ||
          !isElementUnderRemoteRoot(this, documentTarget.body)
        ) {
          return;
        }

        clearCapture(this);
        const element = this;
        const forwardCapturedEvent = (event: Event) => {
          const pointerEvent = event as PointerEvent;
          if (
            pointerEvent.pointerId === pointerId &&
            pointerEvent.type === 'lostpointercapture'
          ) {
            const capture = capturedPointers.get(element);

            if (isDefined(capture)) {
              capture.isCaptured = false;
            }
          }
        };
        const endCaptureAfterDispatch = (event: Event) => {
          if ((event as PointerEvent).pointerId !== pointerId) {
            return;
          }

          const endedCapture = capturedPointers.get(element);

          queueMicrotask(() => {
            if (capturedPointers.get(element) === endedCapture) {
              clearCapture(element);
            }
          });
        };

        for (const eventType of POINTER_GESTURE_END_EVENT_TYPES) {
          documentTarget.addEventListener(eventType, endCaptureAfterDispatch);
        }

        for (const eventType of CAPTURED_POINTER_EVENT_TYPES) {
          element.addEventListener(eventType, forwardCapturedEvent);
        }

        capturedPointers.set(element, {
          pointerId,
          isCaptured: true,
          removeListeners: () => {
            for (const eventType of POINTER_GESTURE_END_EVENT_TYPES) {
              documentTarget.removeEventListener(
                eventType,
                endCaptureAfterDispatch,
              );
            }

            for (const eventType of CAPTURED_POINTER_EVENT_TYPES) {
              element.removeEventListener(eventType, forwardCapturedEvent);
            }
          },
        });
        callRemoteElementMethod(
          element,
          'setPointerCapture',
          pointerId,
          (eventData: SerializedEventData) => {
            if (
              capturedPointers.get(element)?.pointerId !== eventData.pointerId
            ) {
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
        );
      },
    },
    releasePointerCapture: {
      configurable: true,
      value(this: Element, pointerId: number) {
        if (capturedPointers.get(this)?.pointerId !== pointerId) {
          return;
        }

        clearCapture(this);

        if (isElementUnderRemoteRoot(this, documentTarget.body)) {
          callRemoteElementMethod(this, 'releasePointerCapture', pointerId);
        }
      },
    },
    hasPointerCapture: {
      configurable: true,
      value(this: Element, pointerId: number) {
        const capture = capturedPointers.get(this);

        return capture?.pointerId === pointerId && capture.isCaptured;
      },
    },
  });

  geometryStore.subscribeToGeometryUpdates(() => {
    for (const element of capturedPointers.keys()) {
      if (!isElementUnderRemoteRoot(element, documentTarget.body)) {
        clearCapture(element);
      }
    }
  });
};

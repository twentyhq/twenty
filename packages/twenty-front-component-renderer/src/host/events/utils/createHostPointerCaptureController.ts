import { isDefined } from 'twenty-shared/utils';

import { CAPTURED_POINTER_EVENT_TYPES } from '@/constants/CapturedPointerEventTypes';
import { type HostPointerCaptureController } from '@/host/events/types/HostPointerCaptureController';
import { type PushCapturedPointerEvent } from '@/host/events/types/PushCapturedPointerEvent';
import { createCapturedPointerEventForwarder } from '@/host/events/utils/createCapturedPointerEventForwarder';
import { type GeometryTracker } from '@/host/geometry/types/GeometryTracker';

const isCapturedPointerEvent = (nativeEvent: object): boolean =>
  'type' in nativeEvent &&
  CAPTURED_POINTER_EVENT_TYPES.some(
    (capturedEventType) => capturedEventType === nativeEvent.type,
  );

export const createHostPointerCaptureController = ({
  geometryTracker,
}: {
  geometryTracker: GeometryTracker;
}): HostPointerCaptureController => {
  const endSessionByPointerId = new Map<number, () => void>();
  const forwardedPointerEvents = new WeakSet<object>();
  let pushCapturedPointerEvent: PushCapturedPointerEvent | null = null;

  const claimPointerEventForwarding = (nativeEvent: object): boolean => {
    if (forwardedPointerEvents.has(nativeEvent)) {
      return false;
    }

    if (endSessionByPointerId.size > 0 && isCapturedPointerEvent(nativeEvent)) {
      forwardedPointerEvents.add(nativeEvent);
    }

    return true;
  };

  const startPointerCapture = ({
    element,
    pointerId,
  }: {
    element: HTMLElement;
    pointerId: number;
  }) => {
    endSessionByPointerId.get(pointerId)?.();

    const remoteElementId =
      geometryTracker.findRemoteElementIdContainingNode(element);

    if (!isDefined(remoteElementId)) {
      return;
    }

    endSessionByPointerId.set(
      pointerId,
      createCapturedPointerEventForwarder({
        element,
        pointerId,
        claimPointerEventForwarding,
        forwardEvent: (eventData) =>
          pushCapturedPointerEvent?.({ remoteElementId, eventData }),
        onEnd: () => endSessionByPointerId.delete(pointerId),
      }),
    );
  };

  return {
    startPointerCapture,
    claimPointerEventForwarding,
    setPushCapturedPointerEvent: (nextPushCapturedPointerEvent) => {
      pushCapturedPointerEvent = nextPushCapturedPointerEvent;
    },
    reset: () => {
      pushCapturedPointerEvent = null;

      for (const endSession of [...endSessionByPointerId.values()]) {
        endSession();
      }
    },
  };
};

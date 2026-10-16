import { isDefined } from 'twenty-shared/utils';

import { type HostPointerCaptureController } from '@/host/events/types/HostPointerCaptureController';
import { type HostPointerCaptureTransport } from '@/host/events/types/HostPointerCaptureTransport';
import { createCapturedPointerEventForwarder } from '@/host/events/utils/createCapturedPointerEventForwarder';
import { type GeometryTracker } from '@/host/geometry/types/GeometryTracker';
import { type PointerCaptureRequest } from '@/types/PointerCaptureRequest';

type PointerCaptureSession = {
  element: Element;
  workerCaptureToken: number | null;
  end: () => void;
};

export const createHostPointerCaptureController = ({
  geometryTracker,
}: {
  geometryTracker: GeometryTracker;
}): HostPointerCaptureController => {
  const sessionsByPointerId = new Map<number, PointerCaptureSession>();
  let transport: HostPointerCaptureTransport | null = null;

  const findSession = ({
    remoteElementId,
    pointerId,
  }: PointerCaptureRequest): PointerCaptureSession | undefined => {
    const session = sessionsByPointerId.get(pointerId);
    const element = geometryTracker.getRegisteredNode(remoteElementId);

    return isDefined(element) && session?.element === element
      ? session
      : undefined;
  };

  const startPointerCapture = ({
    element,
    pointerId,
  }: {
    element: HTMLElement;
    pointerId: number;
  }) => {
    sessionsByPointerId.get(pointerId)?.end();

    const remoteElementId =
      geometryTracker.findRemoteElementIdContainingNode(element);

    if (!isDefined(remoteElementId)) {
      return;
    }

    const endSession = createCapturedPointerEventForwarder({
      element,
      pointerId,
      eventOwner: geometryTracker.findRemoteElementIdContainingNode,
      forwardEvent: (eventData) =>
        transport?.pushCapturedPointerEvent({ remoteElementId, eventData }),
      onEnd: () => {
        if (sessionsByPointerId.get(pointerId)?.end === endSession) {
          sessionsByPointerId.delete(pointerId);
        }
      },
    });

    sessionsByPointerId.set(pointerId, {
      element,
      workerCaptureToken: null,
      end: endSession,
    });
  };

  const acceptWorkerPointerCapture = (request: PointerCaptureRequest) => {
    const session = findSession(request);

    if (isDefined(session)) {
      session.workerCaptureToken = request.captureToken;
      return;
    }

    transport?.pushPointerCaptureRefusal(request);
  };

  const releaseWorkerPointerCapture = (request: PointerCaptureRequest) => {
    const session = findSession(request);

    if (
      !isDefined(session) ||
      session.workerCaptureToken !== request.captureToken
    ) {
      return;
    }

    session.workerCaptureToken = null;

    if (session.element.hasPointerCapture(request.pointerId)) {
      session.element.releasePointerCapture(request.pointerId);
    }
  };

  return {
    startPointerCapture,
    acceptWorkerPointerCapture,
    releaseWorkerPointerCapture,
    setTransport: (nextTransport) => {
      transport = nextTransport;
    },
    reset: () => {
      for (const session of [...sessionsByPointerId.values()]) {
        session.end();
      }
      sessionsByPointerId.clear();
    },
  };
};

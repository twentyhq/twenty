import { wrapEventHandler } from '@/host/events/utils/wrapEventHandler';
import { createGeometryTrackerStub } from '@/testing/createGeometryTrackerStub';

import { createHostPointerCaptureController } from '../createHostPointerCaptureController';

const createCaptureFixture = () => {
  const element = Object.assign(document.createElement('div'), {
    releasePointerCapture: jest.fn(),
    hasPointerCapture: jest.fn(() => true),
  });
  const geometryTracker = createGeometryTrackerStub();
  const transport = {
    pushCapturedPointerEvent: jest.fn(),
    pushPointerCaptureRefusal: jest.fn(),
  };

  document.body.append(element);
  geometryTracker.getRegisteredNode = jest.fn((remoteElementId) =>
    remoteElementId === 'owned' ? element : undefined,
  );
  geometryTracker.findRemoteElementIdContainingNode = jest.fn((node) =>
    node === element ? 'owned' : undefined,
  );
  const controller = createHostPointerCaptureController({ geometryTracker });

  controller.setTransport(transport);

  return { element, geometryTracker, transport, controller };
};

const startCapturedGesture = ({
  controller,
  element,
  pointerId = 1,
}: {
  controller: ReturnType<typeof createHostPointerCaptureController>;
  element: HTMLElement;
  pointerId?: number;
}) => {
  const addDocumentListener = jest.spyOn(document, 'addEventListener');
  const addElementListener = jest.spyOn(element, 'addEventListener');

  controller.startPointerCapture({ element, pointerId });

  const findDocumentListener = (eventType: string) =>
    addDocumentListener.mock.calls.find(
      ([listenedEventType]) => listenedEventType === eventType,
    )![1] as (event: PointerEvent) => void;
  const capturedGestureListeners = {
    handlePointerMove: findDocumentListener('pointermove'),
    handlePointerUp: findDocumentListener('pointerup'),
    handleCaptureLoss: addElementListener.mock.calls.find(
      ([listenedEventType]) => listenedEventType === 'lostpointercapture',
    )![1] as (event: PointerEvent) => void,
  };

  addDocumentListener.mockRestore();
  addElementListener.mockRestore();

  return capturedGestureListeners;
};

const createNativePointerEvent = (
  overrides: Partial<Record<string, unknown>>,
) =>
  ({
    type: 'pointermove',
    pointerId: 1,
    isTrusted: true,
    target: document.body,
    ...overrides,
  }) as unknown as PointerEvent;

describe('createHostPointerCaptureController', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    document.body.replaceChildren();
  });

  it('should forward every event of the captured pointer, inside or outside the element, until its release', () => {
    const { controller, element, transport } = createCaptureFixture();
    const removeDocumentListener = jest.spyOn(document, 'removeEventListener');
    const { handlePointerMove, handlePointerUp } = startCapturedGesture({
      controller,
      element,
    });
    const hostTarget = document.createElement('input');

    hostTarget.value = 'private host value';
    handlePointerMove(createNativePointerEvent({ pointerId: 2 }));
    handlePointerMove(createNativePointerEvent({ isTrusted: false }));
    expect(transport.pushCapturedPointerEvent).not.toHaveBeenCalled();

    handlePointerMove(
      createNativePointerEvent({ target: element, clientX: 40, buttons: 1 }),
    );
    handlePointerMove(
      createNativePointerEvent({ target: hostTarget, clientX: 80, buttons: 1 }),
    );
    handlePointerUp(
      createNativePointerEvent({
        type: 'pointerup',
        target: hostTarget,
        clientX: 90,
        buttons: 0,
      }),
    );

    expect(transport.pushCapturedPointerEvent.mock.calls).toEqual([
      [
        {
          remoteElementId: 'owned',
          eventData: {
            type: 'pointermove',
            bubbles: true,
            pointerId: 1,
            clientX: 40,
            buttons: 1,
          },
        },
      ],
      [
        {
          remoteElementId: 'owned',
          eventData: {
            type: 'pointermove',
            bubbles: true,
            pointerId: 1,
            clientX: 80,
            buttons: 1,
          },
        },
      ],
      [
        {
          remoteElementId: 'owned',
          eventData: {
            type: 'pointerup',
            bubbles: true,
            pointerId: 1,
            clientX: 90,
            buttons: 0,
          },
        },
      ],
    ]);
    expect(removeDocumentListener).toHaveBeenCalledTimes(3);
  });

  it('should forward a quick release before the worker acknowledges the capture and refuse that late acknowledgement', () => {
    const { controller, element, transport } = createCaptureFixture();
    const { handlePointerUp } = startCapturedGesture({ controller, element });

    handlePointerUp(createNativePointerEvent({ type: 'pointerup' }));
    controller.acceptWorkerPointerCapture({
      remoteElementId: 'owned',
      pointerId: 1,
      captureToken: 4,
    });

    expect(transport.pushCapturedPointerEvent).toHaveBeenCalledWith({
      remoteElementId: 'owned',
      eventData: { type: 'pointerup', bubbles: true, pointerId: 1 },
    });
    expect(transport.pushPointerCaptureRefusal).toHaveBeenCalledWith({
      remoteElementId: 'owned',
      pointerId: 1,
      captureToken: 4,
    });
  });

  it('should forward a captured gesture whose pointer id is zero', () => {
    const { controller, element, transport } = createCaptureFixture();
    const { handlePointerMove } = startCapturedGesture({
      controller,
      element,
      pointerId: 0,
    });

    handlePointerMove(createNativePointerEvent({ pointerId: 0, clientX: 12 }));

    expect(transport.pushCapturedPointerEvent).toHaveBeenCalledWith({
      remoteElementId: 'owned',
      eventData: {
        type: 'pointermove',
        bubbles: true,
        pointerId: 0,
        clientX: 12,
      },
    });
  });

  it.each(['owned listener', 'capture session'])(
    'should deliver a captured event once per renderer when the %s receives it first',
    (firstRecipient) => {
      const { controller, element, geometryTracker, transport } =
        createCaptureFixture();
      const { handlePointerMove } = startCapturedGesture({
        controller,
        element,
      });
      const ownedListener = jest.fn();
      const ownedHandler = wrapEventHandler({
        remoteListener: ownedListener,
        findRemoteElementIdContainingNode:
          geometryTracker.findRemoteElementIdContainingNode,
      });
      const nativeEvent = createNativePointerEvent({
        target: element,
        clientX: 80,
        buttons: 1,
      });
      const deliverOwnedEvent = () =>
        ownedHandler({ ...nativeEvent, bubbles: true, nativeEvent });

      if (firstRecipient === 'owned listener') {
        deliverOwnedEvent();
        handlePointerMove(nativeEvent);
      }

      if (firstRecipient === 'capture session') {
        handlePointerMove(nativeEvent);
        deliverOwnedEvent();
      }

      expect(
        ownedListener.mock.calls.length +
          transport.pushCapturedPointerEvent.mock.calls.length,
      ).toBe(1);
    },
  );

  it('should forward a host capture loss while the gesture continues', () => {
    const { controller, element, transport } = createCaptureFixture();
    const { handleCaptureLoss, handlePointerMove } = startCapturedGesture({
      controller,
      element,
    });

    handleCaptureLoss(
      createNativePointerEvent({ type: 'lostpointercapture', target: element }),
    );
    handlePointerMove(createNativePointerEvent({ clientX: 30 }));

    expect(transport.pushCapturedPointerEvent.mock.calls).toEqual([
      [
        {
          remoteElementId: 'owned',
          eventData: {
            type: 'lostpointercapture',
            bubbles: true,
            pointerId: 1,
          },
        },
      ],
      [
        {
          remoteElementId: 'owned',
          eventData: {
            type: 'pointermove',
            bubbles: true,
            pointerId: 1,
            clientX: 30,
          },
        },
      ],
    ]);
  });

  it('should release native capture only for the worker capture of the active gesture', () => {
    const { controller, element, transport } = createCaptureFixture();
    const { handlePointerUp } = startCapturedGesture({ controller, element });

    controller.acceptWorkerPointerCapture({
      remoteElementId: 'owned',
      pointerId: 1,
      captureToken: 1,
    });
    handlePointerUp(createNativePointerEvent({ type: 'pointerup' }));
    startCapturedGesture({ controller, element });
    controller.releaseWorkerPointerCapture({
      remoteElementId: 'owned',
      pointerId: 1,
      captureToken: 1,
    });

    expect(element.releasePointerCapture).not.toHaveBeenCalled();

    controller.acceptWorkerPointerCapture({
      remoteElementId: 'owned',
      pointerId: 1,
      captureToken: 2,
    });
    controller.releaseWorkerPointerCapture({
      remoteElementId: 'owned',
      pointerId: 1,
      captureToken: 2,
    });

    expect(element.releasePointerCapture).toHaveBeenCalledWith(1);
    expect(transport.pushPointerCaptureRefusal).not.toHaveBeenCalled();
  });

  it('should refuse worker captures without a host capture session', () => {
    const { controller, transport } = createCaptureFixture();

    controller.acceptWorkerPointerCapture({
      remoteElementId: 'unowned',
      pointerId: 1,
      captureToken: 7,
    });

    expect(transport.pushPointerCaptureRefusal).toHaveBeenCalledWith({
      remoteElementId: 'unowned',
      pointerId: 1,
      captureToken: 7,
    });
  });

  it('should end capture sessions on node detachment and controller reset', async () => {
    const { controller, element } = createCaptureFixture();
    const removeDocumentListener = jest.spyOn(document, 'removeEventListener');

    startCapturedGesture({ controller, element });
    element.remove();
    await Promise.resolve();
    expect(removeDocumentListener).toHaveBeenCalledTimes(3);

    document.body.append(element);
    startCapturedGesture({ controller, element });
    controller.reset();
    expect(removeDocumentListener).toHaveBeenCalledTimes(6);
  });
});

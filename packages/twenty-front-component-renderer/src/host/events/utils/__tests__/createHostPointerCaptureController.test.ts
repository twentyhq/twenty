import { wrapEventHandler } from '@/host/events/utils/wrapEventHandler';
import { createGeometryTracker } from '@/host/geometry/utils/createGeometryTracker';

import { createHostPointerCaptureController } from '../createHostPointerCaptureController';

const createCaptureFixture = () => {
  const element = Object.assign(document.createElement('div'), {
    hasPointerCapture: jest.fn(() => true),
  });
  const geometryTracker = createGeometryTracker();
  const pushCapturedPointerEvent = jest.fn();

  document.body.append(element);
  geometryTracker.registerNode('owned', element);
  const controller = createHostPointerCaptureController({ geometryTracker });

  controller.setPushCapturedPointerEvent(pushCapturedPointerEvent);

  return { element, geometryTracker, pushCapturedPointerEvent, controller };
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

  const findListener = ({
    addListener,
    eventType,
  }: {
    addListener: typeof addDocumentListener | typeof addElementListener;
    eventType: string;
  }) =>
    addListener.mock.calls.find(
      ([listenedEventType]) => listenedEventType === eventType,
    )![1] as (event: PointerEvent) => void;
  const capturedGestureListeners = {
    handlePointerMove: findListener({
      addListener: addDocumentListener,
      eventType: 'pointermove',
    }),
    handlePointerUp: findListener({
      addListener: addDocumentListener,
      eventType: 'pointerup',
    }),
    handleCapturingElementPointerMove: findListener({
      addListener: addElementListener,
      eventType: 'pointermove',
    }),
    handleCapturingElementPointerUp: findListener({
      addListener: addElementListener,
      eventType: 'pointerup',
    }),
    handleCaptureLoss: findListener({
      addListener: addElementListener,
      eventType: 'lostpointercapture',
    }),
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
    const { controller, element, pushCapturedPointerEvent } =
      createCaptureFixture();
    const removeDocumentListener = jest.spyOn(document, 'removeEventListener');
    const { handlePointerMove, handlePointerUp } = startCapturedGesture({
      controller,
      element,
    });
    const hostTarget = document.createElement('input');

    hostTarget.value = 'private host value';
    handlePointerMove(createNativePointerEvent({ pointerId: 2 }));
    handlePointerMove(createNativePointerEvent({ isTrusted: false }));
    expect(pushCapturedPointerEvent).not.toHaveBeenCalled();

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

    expect(pushCapturedPointerEvent.mock.calls).toEqual([
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
      [
        {
          remoteElementId: 'owned',
          eventData: {
            type: 'lostpointercapture',
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

  it('should not report a capture release when the element no longer holds the pointer at the gesture end', () => {
    const { controller, element, pushCapturedPointerEvent } =
      createCaptureFixture();
    const { handlePointerUp } = startCapturedGesture({ controller, element });

    element.hasPointerCapture.mockReturnValue(false);
    handlePointerUp(createNativePointerEvent({ type: 'pointerup' }));

    expect(pushCapturedPointerEvent.mock.calls).toEqual([
      [
        {
          remoteElementId: 'owned',
          eventData: { type: 'pointerup', bubbles: true, pointerId: 1 },
        },
      ],
    ]);
  });

  it('should forward captured events at the capturing element before host ancestors handle them', () => {
    const { controller, element, pushCapturedPointerEvent } =
      createCaptureFixture();
    const {
      handleCapturingElementPointerMove,
      handleCapturingElementPointerUp,
      handlePointerUp,
    } = startCapturedGesture({ controller, element });
    const child = document.createElement('span');
    const pointerUp = createNativePointerEvent({
      type: 'pointerup',
      target: element,
      clientX: 70,
    });

    element.append(child);
    handleCapturingElementPointerMove(
      createNativePointerEvent({ target: child, clientX: 20 }),
    );
    handleCapturingElementPointerMove(
      createNativePointerEvent({ target: element, clientX: 40 }),
    );
    handleCapturingElementPointerUp(pointerUp);
    handlePointerUp(pointerUp);

    expect(
      pushCapturedPointerEvent.mock.calls.map(
        ([{ eventData }]) => `${eventData.type}:${eventData.clientX}`,
      ),
    ).toEqual(['pointermove:40', 'pointerup:70', 'lostpointercapture:70']);
  });

  it('should keep independent capture sessions for several pointers of one element', () => {
    const { controller, element, pushCapturedPointerEvent } =
      createCaptureFixture();
    const firstPointer = startCapturedGesture({ controller, element });
    const secondPointer = startCapturedGesture({
      controller,
      element,
      pointerId: 2,
    });

    firstPointer.handlePointerUp(
      createNativePointerEvent({ type: 'pointerup', clientX: 10 }),
    );
    secondPointer.handlePointerMove(
      createNativePointerEvent({ pointerId: 2, clientX: 30 }),
    );

    expect(
      pushCapturedPointerEvent.mock.calls.map(
        ([{ eventData }]) =>
          `${eventData.pointerId}:${eventData.type}:${eventData.clientX}`,
      ),
    ).toEqual([
      '1:pointerup:10',
      '1:lostpointercapture:10',
      '2:pointermove:30',
    ]);
  });

  it('should forward a captured gesture whose pointer id is zero', () => {
    const { controller, element, pushCapturedPointerEvent } =
      createCaptureFixture();
    const { handlePointerMove } = startCapturedGesture({
      controller,
      element,
      pointerId: 0,
    });

    handlePointerMove(createNativePointerEvent({ pointerId: 0, clientX: 12 }));

    expect(pushCapturedPointerEvent).toHaveBeenCalledWith({
      remoteElementId: 'owned',
      eventData: {
        type: 'pointermove',
        bubbles: true,
        pointerId: 0,
        clientX: 12,
      },
    });
  });

  it.each([
    { eventType: 'pointermove', firstRecipient: 'owned listener' },
    { eventType: 'pointermove', firstRecipient: 'capture session' },
    { eventType: 'pointerup', firstRecipient: 'owned listener' },
    { eventType: 'pointerup', firstRecipient: 'capture session' },
  ])(
    'should deliver a captured $eventType once when the $firstRecipient receives it first',
    ({ eventType, firstRecipient }) => {
      const { controller, element, geometryTracker, pushCapturedPointerEvent } =
        createCaptureFixture();
      const { handlePointerMove, handlePointerUp } = startCapturedGesture({
        controller,
        element,
      });
      const ownedListener = jest.fn();
      const ownedHandler = wrapEventHandler({
        remoteListener: ownedListener,
        findRemoteElementIdContainingNode:
          geometryTracker.findRemoteElementIdContainingNode,
        claimPointerEventForwarding: controller.claimPointerEventForwarding,
      });
      const nativeEvent = createNativePointerEvent({
        type: eventType,
        target: element,
        clientX: 80,
      });
      const deliverOwnedEvent = () =>
        ownedHandler({ ...nativeEvent, bubbles: true, nativeEvent });
      const deliverCaptureSessionEvent = () =>
        eventType === 'pointerup'
          ? handlePointerUp(nativeEvent)
          : handlePointerMove(nativeEvent);

      if (firstRecipient === 'owned listener') {
        deliverOwnedEvent();
        deliverCaptureSessionEvent();
      }

      if (firstRecipient === 'capture session') {
        deliverCaptureSessionEvent();
        deliverOwnedEvent();
      }

      const forwardedSessionEvents = pushCapturedPointerEvent.mock.calls.filter(
        ([{ eventData }]) => eventData.type === eventType,
      );

      expect(
        ownedListener.mock.calls.length + forwardedSessionEvents.length,
      ).toBe(1);
    },
  );

  it('should forward a host capture loss while the gesture continues', () => {
    const { controller, element, pushCapturedPointerEvent } =
      createCaptureFixture();
    const { handleCaptureLoss, handlePointerMove } = startCapturedGesture({
      controller,
      element,
    });

    handleCaptureLoss(
      createNativePointerEvent({ type: 'lostpointercapture', target: element }),
    );
    handlePointerMove(createNativePointerEvent({ clientX: 30 }));

    expect(pushCapturedPointerEvent.mock.calls).toEqual([
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

  it('should end capture sessions when the captured node is detached and on controller reset', () => {
    const { controller, element, pushCapturedPointerEvent } =
      createCaptureFixture();
    const removeDocumentListener = jest.spyOn(document, 'removeEventListener');

    const { handlePointerMove } = startCapturedGesture({ controller, element });
    element.remove();
    handlePointerMove(createNativePointerEvent({ clientX: 30 }));
    expect(pushCapturedPointerEvent).not.toHaveBeenCalled();
    expect(removeDocumentListener).toHaveBeenCalledTimes(3);

    document.body.append(element);
    startCapturedGesture({ controller, element });
    controller.reset();
    expect(removeDocumentListener).toHaveBeenCalledTimes(6);

    const { handlePointerMove: handleMoveAfterReset } = startCapturedGesture({
      controller,
      element,
    });
    handleMoveAfterReset(createNativePointerEvent({ clientX: 50 }));
    expect(pushCapturedPointerEvent).not.toHaveBeenCalled();
  });
});

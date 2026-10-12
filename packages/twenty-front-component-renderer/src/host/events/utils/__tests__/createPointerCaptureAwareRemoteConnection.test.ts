import { type RemoteSerializedEventListener } from '@/host/events/types/RemoteSerializedEventListener';
import { wrapEventHandler } from '@/host/events/utils/wrapEventHandler';
import { createGeometryTrackerStub } from '@/testing/createGeometryTrackerStub';

import { createPointerCaptureAwareRemoteConnection } from '../createPointerCaptureAwareRemoteConnection';

const createCaptureFixture = () => {
  const element = Object.assign(document.createElement('div'), {
    releasePointerCapture: jest.fn(),
    hasPointerCapture: jest.fn(() => true),
  });
  const connection = { mutate: jest.fn(), call: jest.fn() };
  const geometryTracker = createGeometryTrackerStub();

  document.body.append(element);
  geometryTracker.getRegisteredNode = jest.fn((remoteElementId) =>
    remoteElementId === 'owned' ? element : undefined,
  );
  const transport = createPointerCaptureAwareRemoteConnection({
    connection,
    geometryTracker,
  });

  return {
    element,
    geometryTracker,
    connection,
    transport,
    captureConnection: transport.connection,
  };
};

describe('createPointerCaptureAwareRemoteConnection', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    document.body.replaceChildren();
  });

  it('should reject unknown nodes, malformed pointer IDs and nodes without native capture', () => {
    const { captureConnection, element, transport } = createCaptureFixture();
    const addEventListener = jest.spyOn(document, 'addEventListener');
    const forwardEvent = jest.fn();

    captureConnection.call('unowned', 'setPointerCapture', 1, forwardEvent);
    captureConnection.call('owned', 'setPointerCapture', '1', forwardEvent);
    captureConnection.call(
      'owned',
      'setPointerCapture',
      Number.NaN,
      forwardEvent,
    );
    element.hasPointerCapture.mockReturnValue(false);
    captureConnection.call('owned', 'setPointerCapture', 1, forwardEvent);
    element.hasPointerCapture.mockReturnValue(true);
    element.remove();
    captureConnection.call('owned', 'setPointerCapture', 1, forwardEvent);
    expect(addEventListener).not.toHaveBeenCalled();
    transport.dispose();
  });

  it('should continue only the granted pointer outside its owner and dispose after release', () => {
    const { captureConnection, element, transport } = createCaptureFixture();
    const addEventListener = jest.spyOn(document, 'addEventListener');
    const removeEventListener = jest.spyOn(document, 'removeEventListener');
    const forwardEvent: RemoteSerializedEventListener = jest.fn();

    captureConnection.call('owned', 'setPointerCapture', 1, forwardEvent);
    const handlePointerEvent = addEventListener.mock.calls.find(
      ([eventType]) => eventType === 'pointermove',
    )![1] as (event: PointerEvent) => void;
    const hostTarget = document.createElement('input');

    hostTarget.value = 'private host value';
    handlePointerEvent({
      type: 'pointermove',
      pointerId: 2,
      isTrusted: true,
      target: hostTarget,
    } as unknown as PointerEvent);
    handlePointerEvent({
      type: 'pointermove',
      pointerId: 1,
      isTrusted: false,
      target: hostTarget,
    } as unknown as PointerEvent);
    handlePointerEvent({
      type: 'pointermove',
      pointerId: 1,
      isTrusted: true,
      target: element,
    } as unknown as PointerEvent);
    expect(forwardEvent).not.toHaveBeenCalled();
    handlePointerEvent({
      type: 'pointermove',
      pointerId: 1,
      isTrusted: true,
      target: hostTarget,
      clientX: 80,
      buttons: 1,
    } as unknown as PointerEvent);
    expect(forwardEvent).toHaveBeenLastCalledWith({
      type: 'pointermove',
      bubbles: true,
      pointerId: 1,
      clientX: 80,
      buttons: 1,
    });
    handlePointerEvent({
      type: 'pointerup',
      pointerId: 1,
      isTrusted: true,
      target: hostTarget,
      clientX: 90,
      buttons: 0,
    } as unknown as PointerEvent);
    expect(removeEventListener).toHaveBeenCalledTimes(3);
    transport.dispose();
    expect(removeEventListener).toHaveBeenCalledTimes(3);
  });

  it.each(['owned listener', 'capture continuation'])(
    'should deliver a captured event once per renderer when %s receives it first',
    (firstRecipient) => {
      const owner = createCaptureFixture();
      const otherRenderer = createCaptureFixture();
      const addEventListener = jest.spyOn(document, 'addEventListener');
      const capturedListener = jest.fn();
      const ownedListener = jest.fn();
      const otherRendererListener = jest.fn();

      owner.captureConnection.call(
        'owned',
        'setPointerCapture',
        1,
        capturedListener,
      );
      otherRenderer.captureConnection.call(
        'owned',
        'setPointerCapture',
        1,
        otherRendererListener,
      );
      const pointerListeners = addEventListener.mock.calls
        .filter(([eventType]) => eventType === 'pointermove')
        .map(([, listener]) => listener as (event: PointerEvent) => void);
      const target = document.createElement('button');
      const nativeEvent = {
        type: 'pointermove',
        pointerId: 1,
        isTrusted: true,
        target,
        clientX: 80,
        buttons: 1,
      } as unknown as PointerEvent;

      const ownedHandler = wrapEventHandler({
        remoteListener: ownedListener,
        findRemoteElementIdContainingNode:
          owner.geometryTracker.findRemoteElementIdContainingNode,
      });
      const deliverCapturedEvent = () => {
        for (const listener of pointerListeners) {
          listener(nativeEvent);
        }
      };
      const deliverOwnedEvent = () =>
        ownedHandler({ ...nativeEvent, bubbles: true, nativeEvent });

      if (firstRecipient === 'owned listener') {
        deliverOwnedEvent();
        deliverCapturedEvent();
      }

      if (firstRecipient === 'capture continuation') {
        deliverCapturedEvent();
        deliverOwnedEvent();
      }

      expect(
        ownedListener.mock.calls.length + capturedListener.mock.calls.length,
      ).toBe(1);
      expect(otherRendererListener).toHaveBeenCalledTimes(1);
      owner.transport.dispose();
      otherRenderer.transport.dispose();
    },
  );

  it('should dispose a cancelled pointer without forwarding unrelated host values', () => {
    const { captureConnection, transport } = createCaptureFixture();
    const addEventListener = jest.spyOn(document, 'addEventListener');
    const removeEventListener = jest.spyOn(document, 'removeEventListener');
    const forwardEvent = jest.fn();

    captureConnection.call('owned', 'setPointerCapture', 7, forwardEvent);
    const handlePointerEvent = addEventListener.mock.calls.find(
      ([eventType]) => eventType === 'pointercancel',
    )![1] as (event: PointerEvent) => void;
    const hostTarget = document.createElement('input');

    hostTarget.value = 'private host value';
    handlePointerEvent({
      type: 'pointercancel',
      pointerId: 7,
      isTrusted: true,
      target: hostTarget,
    } as unknown as PointerEvent);
    expect(forwardEvent).toHaveBeenCalledWith({
      type: 'pointercancel',
      bubbles: true,
      pointerId: 7,
    });
    expect(removeEventListener).toHaveBeenCalledTimes(3);
    transport.dispose();
    expect(removeEventListener).toHaveBeenCalledTimes(3);
  });

  it('should dispose document subscriptions on node detachment and renderer teardown', async () => {
    const { captureConnection, element, transport } = createCaptureFixture();
    const removeEventListener = jest.spyOn(document, 'removeEventListener');

    captureConnection.call('owned', 'setPointerCapture', 1, jest.fn());
    element.remove();
    await Promise.resolve();
    expect(removeEventListener).toHaveBeenCalledTimes(3);
    document.body.append(element);
    captureConnection.call('owned', 'setPointerCapture', 1, jest.fn());
    transport.dispose();
    expect(removeEventListener).toHaveBeenCalledTimes(6);
  });

  it('should release only the matching captured pointer and preserve unrelated methods', () => {
    const { captureConnection, element, connection, transport } =
      createCaptureFixture();

    element.hasPointerCapture.mockReturnValue(false);
    captureConnection.call('owned', 'releasePointerCapture', 1);
    expect(element.releasePointerCapture).not.toHaveBeenCalled();
    element.hasPointerCapture.mockReturnValue(true);
    captureConnection.call('owned', 'releasePointerCapture', 1);
    expect(element.releasePointerCapture).toHaveBeenCalledWith(1);
    captureConnection.call('owned', 'focus', { preventScroll: true });
    expect(connection.call).toHaveBeenCalledWith('owned', 'focus', {
      preventScroll: true,
    });
    transport.dispose();
  });
});

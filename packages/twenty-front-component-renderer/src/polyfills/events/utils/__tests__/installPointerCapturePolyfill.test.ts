import { connectRemoteNode, remoteId } from '@remote-dom/core/elements';
import { Window } from '@remote-dom/polyfill';

import { installPointerCapturePolyfill } from '../installPointerCapturePolyfill';

const createCaptureFixture = () => {
  const polyfillWindow = new Window();
  const documentTarget = polyfillWindow.document as unknown as Document;
  const connection = { mutate: jest.fn(), call: jest.fn() };
  const workerPointerCapture = installPointerCapturePolyfill({
    elementPrototype: polyfillWindow.Element.prototype,
    documentTarget,
  });
  const element = documentTarget.createElement('div');

  connectRemoteNode(documentTarget.body, connection);
  documentTarget.body.append(element);
  connectRemoteNode(element, connection);

  return {
    documentTarget,
    connection,
    polyfillWindow,
    element,
    remoteElementId: remoteId(element),
    workerPointerCapture,
  };
};

const createPointerEvent = ({
  polyfillWindow,
  type,
  pointerId,
}: {
  polyfillWindow: Window;
  type: string;
  pointerId: number;
}) => {
  const event = new polyfillWindow.Event(type, {
    bubbles: true,
  }) as unknown as Event;

  Object.defineProperty(event, 'pointerId', { value: pointerId });

  return event;
};

describe('installPointerCapturePolyfill', () => {
  it('should capture only connected elements and send a capture token with each host request', () => {
    const { documentTarget, connection, element, remoteElementId } =
      createCaptureFixture();
    const detachedElement = documentTarget.createElement('div');

    detachedElement.setPointerCapture(1);
    expect(connection.call).not.toHaveBeenCalled();

    element.setPointerCapture(2);
    element.setPointerCapture(2);
    expect(connection.call).toHaveBeenCalledTimes(1);
    expect(connection.call).toHaveBeenCalledWith(
      remoteElementId,
      'setPointerCapture',
      2,
      1,
    );
    expect(element.hasPointerCapture(2)).toBe(true);

    element.releasePointerCapture(1);
    expect(element.hasPointerCapture(2)).toBe(true);
    element.releasePointerCapture(2);
    expect(element.hasPointerCapture(2)).toBe(false);
    expect(connection.call).toHaveBeenLastCalledWith(
      remoteElementId,
      'releasePointerCapture',
      2,
      1,
    );
  });

  it('should not sync captured pointer listeners to the host element', () => {
    const { connection, element } = createCaptureFixture();

    connection.mutate.mockClear();
    element.setPointerCapture(1);
    element.releasePointerCapture(1);

    expect(connection.mutate).not.toHaveBeenCalled();
  });

  it('should dispatch host-forwarded gesture events to document listeners without a worker capture', () => {
    const { documentTarget, remoteElementId, workerPointerCapture } =
      createCaptureFixture();
    const deliveredMoves: number[] = [];

    documentTarget.addEventListener('pointermove', (event) =>
      deliveredMoves.push(event.clientX),
    );
    workerPointerCapture.dispatchCapturedPointerEvent({
      remoteElementId,
      eventData: {
        type: 'pointermove',
        bubbles: true,
        pointerId: 0,
        clientX: 80,
      },
    });
    workerPointerCapture.dispatchCapturedPointerEvent({
      remoteElementId,
      eventData: { type: 'click', bubbles: true, clientX: 90 },
    });
    workerPointerCapture.dispatchCapturedPointerEvent({
      remoteElementId: 'unknown',
      eventData: { type: 'pointermove', bubbles: true, clientX: 100 },
    });

    expect(deliveredMoves).toEqual([80]);
  });

  it('should clear capture after document listeners finish receiving the gesture end', async () => {
    const { documentTarget, element, polyfillWindow } = createCaptureFixture();
    const capturedDuringPointerUp: boolean[] = [];

    element.setPointerCapture(1);
    documentTarget.addEventListener('pointerup', () =>
      capturedDuringPointerUp.push(element.hasPointerCapture(1)),
    );
    element.dispatchEvent(
      createPointerEvent({ polyfillWindow, type: 'pointerup', pointerId: 1 }),
    );

    expect(capturedDuringPointerUp).toEqual([true]);
    await Promise.resolve();
    expect(element.hasPointerCapture(1)).toBe(false);
  });

  it('should clear capture after the gesture end even when a worker ancestor stops it from bubbling', async () => {
    const { documentTarget, element, polyfillWindow } = createCaptureFixture();
    const wrapper = documentTarget.createElement('div');

    documentTarget.body.append(wrapper);
    wrapper.append(element);
    wrapper.addEventListener('pointerup', (event) => event.stopPropagation());
    element.setPointerCapture(1);
    element.dispatchEvent(
      createPointerEvent({ polyfillWindow, type: 'pointerup', pointerId: 1 }),
    );
    await Promise.resolve();

    expect(element.hasPointerCapture(1)).toBe(false);
  });

  it('should keep separate captures for several pointers of one element', () => {
    const { connection, element, remoteElementId } = createCaptureFixture();

    element.setPointerCapture(1);
    element.setPointerCapture(2);

    expect(element.hasPointerCapture(1)).toBe(true);
    expect(element.hasPointerCapture(2)).toBe(true);
    expect(connection.call.mock.calls).toEqual([
      [remoteElementId, 'setPointerCapture', 1, 1],
      [remoteElementId, 'setPointerCapture', 2, 2],
    ]);

    element.releasePointerCapture(2);

    expect(element.hasPointerCapture(1)).toBe(true);
    expect(element.hasPointerCapture(2)).toBe(false);
    expect(connection.call).toHaveBeenLastCalledWith(
      remoteElementId,
      'releasePointerCapture',
      2,
      2,
    );
  });

  it('should clear capture when the host reports a capture loss and keep delivering the gesture', () => {
    const { documentTarget, element, remoteElementId, workerPointerCapture } =
      createCaptureFixture();
    const deliveredMoves: number[] = [];

    element.setPointerCapture(1);
    documentTarget.addEventListener('pointermove', (event) =>
      deliveredMoves.push(event.clientX),
    );
    workerPointerCapture.dispatchCapturedPointerEvent({
      remoteElementId,
      eventData: { type: 'lostpointercapture', bubbles: true, pointerId: 1 },
    });

    expect(element.hasPointerCapture(1)).toBe(false);

    workerPointerCapture.dispatchCapturedPointerEvent({
      remoteElementId,
      eventData: {
        type: 'pointermove',
        bubbles: true,
        pointerId: 1,
        clientX: 60,
      },
    });

    expect(deliveredMoves).toEqual([60]);
  });

  it('should silently drop a refused capture only when its token matches', () => {
    const { element, remoteElementId, workerPointerCapture } =
      createCaptureFixture();
    const lostPointerCapture = jest.fn();

    element.addEventListener('lostpointercapture', lostPointerCapture);
    element.setPointerCapture(1);
    workerPointerCapture.refusePointerCapture({
      remoteElementId,
      pointerId: 1,
      captureToken: 2,
    });
    expect(element.hasPointerCapture(1)).toBe(true);

    workerPointerCapture.refusePointerCapture({
      remoteElementId,
      pointerId: 1,
      captureToken: 1,
    });

    expect(element.hasPointerCapture(1)).toBe(false);
    expect(lostPointerCapture).not.toHaveBeenCalled();
  });

  it('should preserve a new capture when the previous release cleanup is queued', async () => {
    const { element, polyfillWindow } = createCaptureFixture();

    element.setPointerCapture(1);
    element.dispatchEvent(
      createPointerEvent({ polyfillWindow, type: 'pointerup', pointerId: 1 }),
    );
    element.setPointerCapture(2);
    await Promise.resolve();

    expect(element.hasPointerCapture(2)).toBe(true);
  });

  it('should sweep the capture of an element removed from the remote root', async () => {
    const { element, workerPointerCapture } = createCaptureFixture();

    element.setPointerCapture(1);
    element.remove();
    workerPointerCapture.scheduleDetachedCaptureSweep();
    await Promise.resolve();

    expect(element.hasPointerCapture(1)).toBe(false);
  });
});

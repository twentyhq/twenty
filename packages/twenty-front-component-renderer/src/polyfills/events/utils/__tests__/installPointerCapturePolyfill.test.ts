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
    element,
    remoteElementId: remoteId(element),
    workerPointerCapture,
  };
};

describe('installPointerCapturePolyfill', () => {
  it('should capture only connected elements without sending anything to the host', () => {
    const { documentTarget, connection, element } = createCaptureFixture();
    const detachedElement = documentTarget.createElement('div');

    connection.mutate.mockClear();
    detachedElement.setPointerCapture(1);
    element.setPointerCapture(2);

    expect(detachedElement.hasPointerCapture(1)).toBe(false);
    expect(element.hasPointerCapture(2)).toBe(true);

    element.releasePointerCapture(1);
    expect(element.hasPointerCapture(2)).toBe(true);
    element.releasePointerCapture(2);
    expect(element.hasPointerCapture(2)).toBe(false);
    expect(connection.call).not.toHaveBeenCalled();
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
      remoteElementId: 'unknown',
      eventData: { type: 'pointermove', bubbles: true, clientX: 100 },
    });

    expect(deliveredMoves).toEqual([80]);
  });

  it('should keep the capture through the gesture end until the host reports its release', () => {
    const { documentTarget, element, remoteElementId, workerPointerCapture } =
      createCaptureFixture();
    const capturedDuringPointerUp: boolean[] = [];

    element.setPointerCapture(1);
    documentTarget.addEventListener('pointerup', () =>
      capturedDuringPointerUp.push(element.hasPointerCapture(1)),
    );
    workerPointerCapture.dispatchCapturedPointerEvent({
      remoteElementId,
      eventData: { type: 'pointerup', bubbles: true, pointerId: 1 },
    });

    expect(capturedDuringPointerUp).toEqual([true]);

    workerPointerCapture.dispatchCapturedPointerEvent({
      remoteElementId,
      eventData: { type: 'lostpointercapture', bubbles: true, pointerId: 1 },
    });

    expect(element.hasPointerCapture(1)).toBe(false);
  });

  it('should keep separate captures for several pointers and move a pointer to its latest capturing element', () => {
    const { documentTarget, element } = createCaptureFixture();
    const otherElement = documentTarget.createElement('div');

    documentTarget.body.append(otherElement);
    element.setPointerCapture(1);
    element.setPointerCapture(2);
    element.releasePointerCapture(2);

    expect(element.hasPointerCapture(1)).toBe(true);
    expect(element.hasPointerCapture(2)).toBe(false);

    otherElement.setPointerCapture(1);

    expect(element.hasPointerCapture(1)).toBe(false);
    expect(otherElement.hasPointerCapture(1)).toBe(true);
  });

  it('should clear capture when the host reports a capture loss and keep delivering the gesture', () => {
    const { documentTarget, element, remoteElementId, workerPointerCapture } =
      createCaptureFixture();
    const deliveredMoves: number[] = [];
    const capturedDuringCaptureLoss: boolean[] = [];

    element.setPointerCapture(1);
    element.addEventListener('lostpointercapture', () =>
      capturedDuringCaptureLoss.push(element.hasPointerCapture(1)),
    );
    documentTarget.addEventListener('pointermove', (event) =>
      deliveredMoves.push(event.clientX),
    );
    workerPointerCapture.dispatchCapturedPointerEvent({
      remoteElementId,
      eventData: { type: 'lostpointercapture', bubbles: true, pointerId: 1 },
    });

    expect(capturedDuringCaptureLoss).toEqual([false]);

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

  it('should forget a removed capturing element after the detach sweep and keep a moved one', async () => {
    const { documentTarget, element, workerPointerCapture } =
      createCaptureFixture();
    const movedElement = documentTarget.createElement('div');

    documentTarget.body.append(movedElement);
    element.setPointerCapture(1);
    movedElement.setPointerCapture(2);
    element.remove();
    movedElement.remove();
    workerPointerCapture.scheduleDetachedCaptureSweep();
    documentTarget.body.append(movedElement);

    expect(element.hasPointerCapture(1)).toBe(false);

    await Promise.resolve();
    documentTarget.body.append(element);

    expect(element.hasPointerCapture(1)).toBe(false);
    expect(movedElement.hasPointerCapture(2)).toBe(true);
  });
});

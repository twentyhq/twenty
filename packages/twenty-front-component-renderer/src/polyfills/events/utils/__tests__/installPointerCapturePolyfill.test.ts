import { connectRemoteNode, remoteId } from '@remote-dom/core/elements';
import { Window } from '@remote-dom/polyfill';

import { createWorkerGeometryStore } from '@/polyfills/geometry/utils/createWorkerGeometryStore';

import { installPointerCapturePolyfill } from '../installPointerCapturePolyfill';

const createCaptureFixture = () => {
  const polyfillWindow = new Window();
  const documentTarget = polyfillWindow.document as unknown as Document;
  const geometryStore = createWorkerGeometryStore();
  const connection = { mutate: jest.fn(), call: jest.fn() };

  installPointerCapturePolyfill({
    elementPrototype: polyfillWindow.Element.prototype,
    documentTarget,
    geometryStore,
  });
  connectRemoteNode(documentTarget.body, connection);

  return { documentTarget, geometryStore, connection, polyfillWindow };
};

describe('installPointerCapturePolyfill', () => {
  it('should capture only owned elements and release the matching pointer', () => {
    const { documentTarget, connection } = createCaptureFixture();
    const ownedElement = documentTarget.createElement('div');
    const detachedElement = documentTarget.createElement('div');

    documentTarget.body.append(ownedElement);
    connectRemoteNode(ownedElement, connection);
    remoteId(ownedElement);
    detachedElement.setPointerCapture(1);
    expect(connection.call).not.toHaveBeenCalled();
    ownedElement.setPointerCapture(2);
    expect(connection.call).toHaveBeenCalledWith(
      remoteId(ownedElement),
      'setPointerCapture',
      2,
      expect.any(Function),
    );
    expect(ownedElement.hasPointerCapture(2)).toBe(true);
    ownedElement.releasePointerCapture(1);
    expect(ownedElement.hasPointerCapture(2)).toBe(true);
    ownedElement.releasePointerCapture(2);
    expect(ownedElement.hasPointerCapture(2)).toBe(false);
    expect(connection.call).toHaveBeenLastCalledWith(
      remoteId(ownedElement),
      'releasePointerCapture',
      2,
    );
  });

  it('should clear completed capture after document listeners finish receiving pointerup', async () => {
    const { documentTarget, connection, polyfillWindow } =
      createCaptureFixture();
    const element = documentTarget.createElement('div');
    const capturedDuringPointerUp: boolean[] = [];

    documentTarget.body.append(element);
    connectRemoteNode(element, connection);
    remoteId(element);
    element.setPointerCapture(1);
    documentTarget.addEventListener('pointerup', () =>
      capturedDuringPointerUp.push(element.hasPointerCapture(1)),
    );
    const event = new polyfillWindow.Event('pointerup', {
      bubbles: true,
    }) as unknown as Event;

    Object.defineProperty(event, 'pointerId', { value: 1 });
    element.dispatchEvent(event);
    expect(capturedDuringPointerUp).toEqual([true]);
    await Promise.resolve();
    expect(element.hasPointerCapture(1)).toBe(false);
  });

  it('should keep the started gesture connected through release after capture loss', async () => {
    const { documentTarget, connection, polyfillWindow } =
      createCaptureFixture();
    const element = documentTarget.createElement('div');
    const deliveredMoves: number[] = [];

    documentTarget.body.append(element);
    connectRemoteNode(element, connection);
    remoteId(element);
    element.setPointerCapture(1);
    const forwardCapturedEvent = connection.call.mock
      .calls[0][3] as (eventData: {
      type: string;
      bubbles: boolean;
      pointerId: number;
      clientX?: number;
    }) => void;
    const captureLoss = new polyfillWindow.Event('lostpointercapture', {
      bubbles: true,
    }) as unknown as Event;

    Object.defineProperty(captureLoss, 'pointerId', { value: 1 });
    element.dispatchEvent(captureLoss);
    expect(element.hasPointerCapture(1)).toBe(false);
    documentTarget.addEventListener('pointermove', (event) =>
      deliveredMoves.push(event.clientX),
    );
    forwardCapturedEvent({
      type: 'pointermove',
      bubbles: true,
      pointerId: 1,
      clientX: 80,
    });
    expect(deliveredMoves).toEqual([80]);
    forwardCapturedEvent({ type: 'pointerup', bubbles: true, pointerId: 1 });
    await Promise.resolve();
    forwardCapturedEvent({
      type: 'pointermove',
      bubbles: true,
      pointerId: 1,
      clientX: 90,
    });
    expect(deliveredMoves).toEqual([80]);
  });

  it('should clear detached capture when host geometry removes its element', () => {
    const { documentTarget, geometryStore, connection } =
      createCaptureFixture();
    const element = documentTarget.createElement('div');

    documentTarget.body.append(element);
    connectRemoteNode(element, connection);
    remoteId(element);
    element.setPointerCapture(1);
    element.remove();
    geometryStore.applyGeometryBatch({
      removedRemoteElementIds: [remoteId(element)],
    });
    expect(element.hasPointerCapture(1)).toBe(false);
  });
});

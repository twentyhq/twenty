import { connectRemoteNode, remoteId } from '@remote-dom/core/elements';
import { Window } from '@remote-dom/polyfill';

import { installEventConstructorPolyfills } from '@/polyfills/events/utils/installEventConstructorPolyfills';
import { toGlobalScopeRecord } from '@/polyfills/utils/toGlobalScopeRecord';
import { dispatchOwnedPressEvent } from '@/remote/elements/utils/dispatchOwnedPressEvent';

const createOwnedPressFixture = () => {
  const polyfillWindow = new Window();
  installEventConstructorPolyfills({
    globalScope: toGlobalScopeRecord(polyfillWindow),
  });
  const documentTarget = polyfillWindow.document as unknown as Document;
  const connection = { mutate: jest.fn(), call: jest.fn() };
  const backdrop = documentTarget.createElement('div');

  connectRemoteNode(documentTarget.body, connection);
  documentTarget.body.append(backdrop);
  connectRemoteNode(backdrop, connection);

  return {
    polyfillWindow,
    documentTarget,
    backdrop,
    backdropRemoteElementId: remoteId(backdrop),
  };
};

describe('dispatchOwnedPressEvent', () => {
  it('dispatches the press at its owned target with its event data, as the current window event', () => {
    const {
      polyfillWindow,
      documentTarget,
      backdrop,
      backdropRemoteElementId,
    } = createOwnedPressFixture();
    const receivedPresses: { event: Event; windowEvent: unknown }[] = [];

    documentTarget.addEventListener(
      'pointerdown',
      (event) => {
        receivedPresses.push({
          event,
          windowEvent: Reflect.get(polyfillWindow, 'event'),
        });
      },
      true,
    );

    dispatchOwnedPressEvent({
      documentTarget,
      eventData: {
        type: 'pointerdown',
        bubbles: true,
        targetRemoteElementId: backdropRemoteElementId,
        clientX: 12,
        button: 0,
      },
    });

    const [receivedPress] = receivedPresses;

    expect(receivedPresses).toHaveLength(1);
    expect(receivedPress?.event.target).toBe(backdrop);
    expect(receivedPress?.event).toMatchObject({ bubbles: true, clientX: 12 });
    expect(receivedPress?.windowEvent).toBe(receivedPress?.event);
    expect(Reflect.get(polyfillWindow, 'event')).toBeUndefined();
  });

  it('drops a press whose target is no longer in the document', () => {
    const { documentTarget } = createOwnedPressFixture();
    const documentListener = jest.fn();

    documentTarget.addEventListener('click', documentListener);

    dispatchOwnedPressEvent({
      documentTarget,
      eventData: {
        type: 'click',
        bubbles: true,
        targetRemoteElementId: 'removed-element',
      },
    });

    expect(documentListener).not.toHaveBeenCalled();
  });
});

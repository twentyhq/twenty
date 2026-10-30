import { Window } from '@remote-dom/polyfill';

import { installEventConstructorPolyfills } from '@/polyfills/events/utils/installEventConstructorPolyfills';
import { isHostOriginatedEvent } from '@/polyfills/events/utils/isHostOriginatedEvent';
import { toGlobalScopeRecord } from '@/polyfills/utils/toGlobalScopeRecord';
import { dispatchOutsidePressEvent } from '@/remote/elements/utils/dispatchOutsidePressEvent';

describe('dispatchOutsidePressEvent', () => {
  it('dispatches through document capture and the body target without visiting owned descendants', () => {
    const polyfillWindow = new Window();
    installEventConstructorPolyfills({
      globalScope: toGlobalScopeRecord(polyfillWindow),
    });
    const documentTarget = polyfillWindow.document as unknown as Document;
    const popup = documentTarget.createElement('div');
    documentTarget.body.append(popup);
    const popupListener = jest.fn();
    popup.addEventListener('pointerdown', popupListener);
    const receivedPhases: string[] = [];
    const receivedEvents: Event[] = [];

    documentTarget.addEventListener(
      'pointerdown',
      (event) => {
        receivedPhases.push('document-capture');
        receivedEvents.push(event);
        expect(isHostOriginatedEvent(event)).toBe(true);
        event.target?.addEventListener('pointerdown', () => {
          receivedPhases.push('body-target');
        });
      },
      true,
    );
    documentTarget.addEventListener('pointerdown', () => {
      receivedPhases.push('document-bubble');
    });

    dispatchOutsidePressEvent({
      documentTarget,
      eventData: {
        type: 'pointerdown',
        button: 0,
        buttons: 1,
        detail: 1,
        pointerType: 'mouse',
      },
    });
    const [receivedEvent] = receivedEvents;

    expect(receivedPhases).toEqual([
      'document-capture',
      'body-target',
      'document-bubble',
    ]);
    expect(receivedEvent?.target).toBe(documentTarget.body);
    expect(receivedEvent).toMatchObject({
      pointerType: 'mouse',
      button: 0,
      buttons: 1,
      detail: 1,
      clientX: 0,
      clientY: 0,
    });
    expect(popupListener).not.toHaveBeenCalled();
  });

  it('exposes the press as the current window event while it is dispatched', () => {
    const polyfillWindow = new Window();
    installEventConstructorPolyfills({
      globalScope: toGlobalScopeRecord(polyfillWindow),
    });
    const documentTarget = polyfillWindow.document as unknown as Document;
    const receivedPresses: { event: Event; windowEvent: Event | undefined }[] =
      [];

    documentTarget.addEventListener('mousedown', (event) => {
      receivedPresses.push({
        event,
        windowEvent: Reflect.get(polyfillWindow, 'event'),
      });
    });

    dispatchOutsidePressEvent({
      documentTarget,
      eventData: {
        type: 'mousedown',
        button: 0,
        buttons: 1,
        detail: 1,
        pointerType: 'mouse',
      },
    });

    const [receivedPress] = receivedPresses;

    expect(receivedPresses).toHaveLength(1);
    expect(receivedPress?.windowEvent).toBe(receivedPress?.event);
    expect(Reflect.get(polyfillWindow, 'event')).toBeUndefined();
  });
});

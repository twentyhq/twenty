import { Window } from '@remote-dom/polyfill';

import { installEventConstructorPolyfills } from '@/polyfills/events/utils/installEventConstructorPolyfills';
import { toGlobalScopeRecord } from '@/polyfills/utils/toGlobalScopeRecord';

import { installElementClickMethodPolyfill } from '../installElementClickMethodPolyfill';

const createPolyfillDocument = (): Document => {
  const polyfillWindow = new Window();

  installEventConstructorPolyfills({
    globalScope: toGlobalScopeRecord(polyfillWindow),
  });
  installElementClickMethodPolyfill(polyfillWindow.Element.prototype);

  return polyfillWindow.document as unknown as Document;
};

describe('installElementClickMethodPolyfill', () => {
  it('should dispatch a bubbling, cancelable pointer click carrying react compatibility', () => {
    const document = createPolyfillDocument();
    const container = document.createElement('div');
    const button = document.createElement('button');
    const receivedEvents: Event[] = [];

    container.append(button);
    container.addEventListener('click', (event) => {
      receivedEvents.push(event);
    });

    button.click();

    expect(receivedEvents).toHaveLength(1);
    const [clickEvent] = receivedEvents;
    expect(clickEvent).toBeInstanceOf(
      toGlobalScopeRecord(document.defaultView ?? {}).PointerEvent as Function,
    );
    expect(clickEvent.type).toBe('click');
    expect(clickEvent.bubbles).toBe(true);
    expect(clickEvent.cancelable).toBe(true);
    expect(clickEvent.composed).toBe(true);
    expect(clickEvent.isTrusted).toBe(false);
    expect(clickEvent.target).toBe(button);
    expect(clickEvent).toHaveProperty('nativeEvent', clickEvent);
  });

  it('should not dispatch a click on a disabled control', () => {
    const document = createPolyfillDocument();
    const button = document.createElement('button');
    const clickListener = jest.fn();

    button.setAttribute('disabled', '');
    button.addEventListener('click', clickListener);

    button.click();

    expect(clickListener).not.toHaveBeenCalled();
  });
});

import { Window } from '@remote-dom/polyfill';

import { setHostEventDispatchTarget } from '@/polyfills/events/utils/setHostEventDispatchTarget';

import { installHostEventRetargetingPolyfill } from '../installHostEventRetargetingPolyfill';

const createNestedButton = () => {
  const polyfillWindow = new Window();

  installHostEventRetargetingPolyfill(
    polyfillWindow.Element.prototype as unknown as EventTarget,
  );

  const document = polyfillWindow.document as unknown as Document;
  const container = document.createElement('div');
  const button = document.createElement('button');
  const createEvent = (type: string, eventInit?: EventInit): Event =>
    new polyfillWindow.Event(type, eventInit) as unknown as Event;

  container.append(button);
  document.body.append(container);

  return { container, button, createEvent };
};

describe('installHostEventRetargetingPolyfill', () => {
  it('should dispatch a host event once at its host target when the listening element dispatches it', () => {
    const { container, button, createEvent } = createNestedButton();
    const receivedTargets: unknown[] = [];
    const event = createEvent('click', { bubbles: true });

    container.addEventListener('click', (receivedEvent) => {
      receivedTargets.push(receivedEvent.target);
    });
    setHostEventDispatchTarget({ event, dispatchTarget: button });

    container.dispatchEvent(event);

    expect(receivedTargets).toEqual([button]);
  });

  it('should dispatch normally when the host target is the listening element', () => {
    const { button, createEvent } = createNestedButton();
    const buttonListener = jest.fn();
    const event = createEvent('click');

    button.addEventListener('click', buttonListener);
    setHostEventDispatchTarget({ event, dispatchTarget: button });

    button.dispatchEvent(event);

    expect(buttonListener).toHaveBeenCalledTimes(1);
    expect(event.target).toBe(button);
  });

  it('should only redirect the first dispatch of a host event', () => {
    const { container, button, createEvent } = createNestedButton();
    const event = createEvent('click');

    setHostEventDispatchTarget({ event, dispatchTarget: button });
    container.dispatchEvent(event);
    container.dispatchEvent(event);

    expect(event.target).toBe(container);
  });

  it('should leave events without a host target untouched', () => {
    const { container, createEvent } = createNestedButton();
    const event = createEvent('click');

    container.dispatchEvent(event);

    expect(event.target).toBe(container);
  });
});

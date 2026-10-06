import '@/remote/generated/remote-elements';

import { remoteId } from '@remote-dom/core/elements';
import { Window } from '@remote-dom/polyfill';

import { installEventConstructorPolyfills } from '@/polyfills/events/utils/installEventConstructorPolyfills';
import { installHostEventRetargetingPolyfill } from '@/polyfills/events/utils/installHostEventRetargetingPolyfill';
import { isHostOriginatedEvent } from '@/polyfills/events/utils/isHostOriginatedEvent';
import { toGlobalScopeRecord } from '@/polyfills/utils/toGlobalScopeRecord';

import { createWorkerEventFromSerializedEvent } from '../createWorkerEventFromSerializedEvent';

installEventConstructorPolyfills({ globalScope: toGlobalScopeRecord(window) });
installHostEventRetargetingPolyfill(HTMLElement.prototype);

const createListeningElement = (): HTMLElement =>
  document.createElement('html-input') as HTMLElement;

const createConnectedInputInsideContainer = () => {
  const container = document.createElement('html-div') as HTMLElement;
  const input = document.createElement('html-input') as HTMLInputElement;

  container.append(input);
  document.body.append(container);

  return { container, input };
};

describe('createWorkerEventFromSerializedEvent', () => {
  it.each([
    ['focusin', 'FocusEvent'],
    ['paste', 'ClipboardEvent'],
  ])(
    'should use the existing worker %s constructor',
    (eventType, eventClassName) => {
      const polyfillWindow = new Window();
      const listeningElement = polyfillWindow.document.createElement(
        'input',
      ) as unknown as Element;
      const eventClassScope = toGlobalScopeRecord(polyfillWindow);
      const eventClass = eventClassScope[eventClassName];

      installEventConstructorPolyfills({ globalScope: eventClassScope });

      const event = createWorkerEventFromSerializedEvent({
        listeningElement,
        eventType,
        eventData: { type: eventType, clipboardText: 'pasted' },
      });
      const listener = jest.fn();

      listeningElement.addEventListener(eventType, listener);
      listeningElement.dispatchEvent(event);

      expect(eventClassScope[eventClassName]).toBe(eventClass);
      expect(event).toBeInstanceOf(eventClass);
      expect(listener).toHaveBeenCalledWith(event);
      expect(event.target).toBe(listeningElement);
      expect(isHostOriginatedEvent(event)).toBe(true);
    },
  );

  it('should build a typed pointer event carrying the serialized properties', () => {
    const event = createWorkerEventFromSerializedEvent({
      listeningElement: createListeningElement(),
      eventType: 'pointerdown',
      eventData: {
        type: 'pointerdown',
        clientX: 4,
        clientY: 8,
        detail: 1,
        pointerType: 'mouse',
        width: 1,
        height: 1,
        pressure: 0.5,
        button: 0,
        buttons: 1,
      },
    });

    expect(event).toBeInstanceOf(PointerEvent);
    expect(event).toMatchObject({
      type: 'pointerdown',
      bubbles: false,
      cancelable: true,
      clientX: 4,
      clientY: 8,
      detail: 1,
      pointerType: 'mouse',
      width: 1,
      height: 1,
      pressure: 0.5,
      button: 0,
      buttons: 1,
    });
  });

  it('should give the event react synthetic event compatibility and the host marker', () => {
    const event = createWorkerEventFromSerializedEvent({
      listeningElement: createListeningElement(),
      eventType: 'click',
      eventData: { type: 'click' },
    });

    expect(event).toHaveProperty('nativeEvent', event);
    expect(event).toHaveProperty('isDefaultPrevented', expect.any(Function));
    expect(event).toHaveProperty('isPropagationStopped', expect.any(Function));
    expect(event).toHaveProperty('persist', expect.any(Function));
    expect(isHostOriginatedEvent(event)).toBe(true);
  });

  it.each([
    ['keydown', KeyboardEvent, { key: 'Escape' }],
    ['beforeinput', InputEvent, { inputType: 'insertText', data: 'a' }],
    ['wheel', WheelEvent, { deltaY: 12 }],
    ['focusin', FocusEvent, {}],
    ['mousedown', MouseEvent, { clientX: 2 }],
  ])(
    'should build %s events with the matching constructor',
    (eventType, eventClass, eventProperties) => {
      const event = createWorkerEventFromSerializedEvent({
        listeningElement: createListeningElement(),
        eventType,
        eventData: { type: eventType, ...eventProperties },
      });

      expect(event).toBeInstanceOf(eventClass);
      expect(event).toMatchObject(eventProperties);
    },
  );

  it('should fall back to a plain event with synthesized clipboard data when no typed class exists', () => {
    const event = createWorkerEventFromSerializedEvent({
      listeningElement: createListeningElement(),
      eventType: 'paste',
      eventData: { type: 'paste', clipboardText: 'pasted' },
    });

    expect(event).toBeInstanceOf(Event);
    expect(event).not.toBeInstanceOf(CustomEvent);
    expect(event).toHaveProperty('clipboardData.types', ['text/plain']);
  });

  it('should reach the property handler of the remote element it is dispatched on', () => {
    const listeningElement = createListeningElement();
    const receivedEvents: Event[] = [];

    listeningElement.onchange = (event) => {
      receivedEvents.push(event);
    };

    const event = createWorkerEventFromSerializedEvent({
      listeningElement,
      eventType: 'change',
      eventData: { type: 'change' },
    });
    listeningElement.dispatchEvent(event);

    expect(receivedEvents).toEqual([event]);
    expect(event.target).toBe(listeningElement);
  });

  it('should bubble only when the host event bubbled', () => {
    const { container, input } = createConnectedInputInsideContainer();
    const containerListener = jest.fn();

    container.addEventListener('click', containerListener);

    input.dispatchEvent(
      createWorkerEventFromSerializedEvent({
        listeningElement: input,
        eventType: 'click',
        eventData: { type: 'click' },
      }),
    );
    expect(containerListener).not.toHaveBeenCalled();

    const bubblingEvent = createWorkerEventFromSerializedEvent({
      listeningElement: input,
      eventType: 'click',
      eventData: { type: 'click', bubbles: true },
    });
    input.dispatchEvent(bubblingEvent);

    expect(bubblingEvent.bubbles).toBe(true);
    expect(containerListener).toHaveBeenCalledWith(bubblingEvent);
  });

  it('should dispatch at the host target inside the listening element and write the target state there', () => {
    const { container, input } = createConnectedInputInsideContainer();
    const containerListener = jest.fn();

    container.addEventListener('input', containerListener);

    const event = createWorkerEventFromSerializedEvent({
      listeningElement: container,
      eventType: 'input',
      eventData: {
        type: 'input',
        bubbles: true,
        targetRemoteElementId: remoteId(input),
        value: 'typed',
      },
    });
    container.dispatchEvent(event);

    expect(containerListener).toHaveBeenCalledTimes(1);
    expect(event.target).toBe(input);
    expect(input.value).toBe('typed');
    expect(container).not.toHaveProperty('value');
  });

  it('should dispatch at the listening element when the host target is not inside it', () => {
    const { container } = createConnectedInputInsideContainer();
    const event = createWorkerEventFromSerializedEvent({
      listeningElement: container,
      eventType: 'click',
      eventData: {
        type: 'click',
        bubbles: true,
        targetRemoteElementId: 'unknown-remote-element',
      },
    });

    container.dispatchEvent(event);

    expect(event.target).toBe(container);
  });

  it('should resolve the related target from its remote id', () => {
    const { input: blurredInput } = createConnectedInputInsideContainer();
    const { input: focusedInput } = createConnectedInputInsideContainer();

    const event = createWorkerEventFromSerializedEvent({
      listeningElement: blurredInput,
      eventType: 'focusout',
      eventData: {
        type: 'focusout',
        bubbles: true,
        relatedTargetRemoteElementId: remoteId(focusedInput),
      },
    });

    expect(event).toHaveProperty('relatedTarget', focusedInput);
  });
});

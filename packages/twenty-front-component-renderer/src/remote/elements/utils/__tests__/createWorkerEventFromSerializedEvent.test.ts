import '@/remote/generated/remote-elements';

import { installEventConstructorPolyfills } from '@/polyfills/events/utils/installEventConstructorPolyfills';
import { isHostOriginatedEvent } from '@/polyfills/events/utils/isHostOriginatedEvent';
import { toGlobalScopeRecord } from '@/polyfills/utils/toGlobalScopeRecord';

import { createWorkerEventFromSerializedEvent } from '../createWorkerEventFromSerializedEvent';

installEventConstructorPolyfills({ globalScope: toGlobalScopeRecord(window) });

const createTarget = (): HTMLElement =>
  document.createElement('html-input') as HTMLElement;

describe('createWorkerEventFromSerializedEvent', () => {
  it('should build a typed pointer event carrying the serialized properties', () => {
    const event = createWorkerEventFromSerializedEvent({
      target: createTarget(),
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
      target: createTarget(),
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
        target: createTarget(),
        eventType,
        eventData: { type: eventType, ...eventProperties },
      });

      expect(event).toBeInstanceOf(eventClass);
      expect(event).toMatchObject(eventProperties);
    },
  );

  it('should fall back to a plain event with synthesized clipboard data when no typed class exists', () => {
    const event = createWorkerEventFromSerializedEvent({
      target: createTarget(),
      eventType: 'paste',
      eventData: { type: 'paste', clipboardText: 'pasted' },
    });

    expect(event).toBeInstanceOf(Event);
    expect(event).not.toBeInstanceOf(CustomEvent);
    expect(event).toHaveProperty('clipboardData.types', ['text/plain']);
  });

  it('should reach the property handler of the remote element it is dispatched on', () => {
    const target = createTarget();
    const receivedEvents: Event[] = [];

    target.onchange = (event) => {
      receivedEvents.push(event);
    };

    const event = createWorkerEventFromSerializedEvent({
      target,
      eventType: 'change',
      eventData: { type: 'change' },
    });
    target.dispatchEvent(event);

    expect(receivedEvents).toEqual([event]);
    expect(event.target).toBe(target);
  });
});

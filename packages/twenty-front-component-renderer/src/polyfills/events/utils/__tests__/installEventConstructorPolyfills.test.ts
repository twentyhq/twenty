import { Window } from '@remote-dom/polyfill';

import { toGlobalScopeRecord } from '@/polyfills/utils/toGlobalScopeRecord';

import { installEventConstructorPolyfills } from '../installEventConstructorPolyfills';

const readEventClass = <TEventClass>(
  scope: Record<string, unknown>,
  eventClassName: string,
): TEventClass => scope[eventClassName] as TEventClass;

const createInstalledScope = () => {
  const polyfillWindow = new Window();
  const globalScope: Record<string, unknown> = {
    window: polyfillWindow,
    Event: polyfillWindow.Event,
  };

  installEventConstructorPolyfills({ globalScope });

  return {
    globalScope,
    polyfillWindow,
    polyfillWindowRecord: toGlobalScopeRecord(polyfillWindow),
    document: polyfillWindow.document as unknown as Document,
  };
};

describe('installEventConstructorPolyfills', () => {
  it('should install the same constructors on the global scope and the polyfill window', () => {
    const { globalScope, polyfillWindowRecord } = createInstalledScope();

    for (const eventClassName of [
      'UIEvent',
      'MouseEvent',
      'PointerEvent',
      'WheelEvent',
      'KeyboardEvent',
      'InputEvent',
    ]) {
      expect(globalScope[eventClassName]).toEqual(expect.any(Function));
      expect(polyfillWindowRecord[eventClassName]).toBe(
        globalScope[eventClassName],
      );
    }
  });

  it('should keep a constructor a target already defines', () => {
    const polyfillWindow = new Window();
    const existingMouseEventClass = class {};
    const globalScope: Record<string, unknown> = {
      window: polyfillWindow,
      Event: polyfillWindow.Event,
      MouseEvent: existingMouseEventClass,
    };

    installEventConstructorPolyfills({ globalScope });

    expect(globalScope.MouseEvent).toBe(existingMouseEventClass);
    expect(toGlobalScopeRecord(polyfillWindow).MouseEvent).not.toBe(
      existingMouseEventClass,
    );
  });

  it('should build pointer events on top of the polyfill event hierarchy', () => {
    const { globalScope, polyfillWindow } = createInstalledScope();
    const PointerEventImplementation = readEventClass<typeof PointerEvent>(
      globalScope,
      'PointerEvent',
    );

    const pointerEvent = new PointerEventImplementation('pointerdown', {
      bubbles: true,
      clientX: 12,
      clientY: 34,
      detail: 1,
      pointerId: 7,
      pointerType: 'mouse',
      shiftKey: true,
    });

    expect(pointerEvent).toBeInstanceOf(polyfillWindow.Event);
    expect(pointerEvent).toBeInstanceOf(globalScope.UIEvent);
    expect(pointerEvent).toBeInstanceOf(globalScope.MouseEvent);
    expect(pointerEvent.type).toBe('pointerdown');
    expect(pointerEvent.bubbles).toBe(true);
    expect(pointerEvent.detail).toBe(1);
    expect(pointerEvent.clientX).toBe(12);
    expect(pointerEvent.x).toBe(12);
    expect(pointerEvent.pageX).toBe(12);
    expect(pointerEvent.clientY).toBe(34);
    expect(pointerEvent.pointerId).toBe(7);
    expect(pointerEvent.pointerType).toBe('mouse');
    expect(pointerEvent.width).toBe(1);
    expect(pointerEvent.height).toBe(1);
    expect(pointerEvent.isPrimary).toBe(false);
    expect(pointerEvent.getModifierState('Shift')).toBe(true);
    expect(pointerEvent.getModifierState('Alt')).toBe(false);
    expect(pointerEvent.getCoalescedEvents()).toEqual([]);
  });

  it('should default a click constructed without pointer data to a non-virtual contact', () => {
    const { globalScope } = createInstalledScope();
    const PointerEventImplementation = readEventClass<typeof PointerEvent>(
      globalScope,
      'PointerEvent',
    );

    const clickEvent = new PointerEventImplementation('click');

    expect(clickEvent.detail).toBe(0);
    expect(clickEvent.button).toBe(0);
    expect(clickEvent.buttons).toBe(0);
    expect(clickEvent.pressure).toBe(0);
    expect(clickEvent.pointerType).toBe('');
    expect(clickEvent.relatedTarget).toBeNull();
    expect(clickEvent.defaultPrevented).toBe(false);
  });

  it('should dispatch constructed events through polyfill event targets', () => {
    const { globalScope, document } = createInstalledScope();
    const PointerEventImplementation = readEventClass<typeof PointerEvent>(
      globalScope,
      'PointerEvent',
    );
    const parent = document.createElement('div');
    const child = document.createElement('button');
    const receivedEvents: Event[] = [];

    parent.append(child);
    parent.addEventListener('click', (event) => {
      receivedEvents.push(event);
    });

    const clickEvent = new PointerEventImplementation('click', {
      bubbles: true,
      cancelable: true,
    });
    child.dispatchEvent(clickEvent);

    expect(receivedEvents).toEqual([clickEvent]);
    expect(clickEvent.target).toBe(child);
    expect(clickEvent.composedPath()[0]).toBe(child);
  });

  it('should expose keyboard event data and location constants', () => {
    const { globalScope } = createInstalledScope();
    const KeyboardEventImplementation = readEventClass<typeof KeyboardEvent>(
      globalScope,
      'KeyboardEvent',
    );

    const keyboardEvent = new KeyboardEventImplementation('keydown', {
      key: 'Enter',
      code: 'NumpadEnter',
      location: KeyboardEventImplementation.DOM_KEY_LOCATION_NUMPAD,
      ctrlKey: true,
      repeat: true,
    });

    expect(keyboardEvent).toBeInstanceOf(globalScope.UIEvent);
    expect(keyboardEvent.key).toBe('Enter');
    expect(keyboardEvent.code).toBe('NumpadEnter');
    expect(keyboardEvent.location).toBe(3);
    expect(keyboardEvent.repeat).toBe(true);
    expect(keyboardEvent.isComposing).toBe(false);
    expect(keyboardEvent.getModifierState('Control')).toBe(true);
    expect(KeyboardEventImplementation.DOM_KEY_LOCATION_STANDARD).toBe(0);
  });

  it('should expose input event data', () => {
    const { globalScope } = createInstalledScope();
    const InputEventImplementation = readEventClass<typeof InputEvent>(
      globalScope,
      'InputEvent',
    );

    const inputEvent = new InputEventImplementation('beforeinput', {
      data: 'a',
      inputType: 'insertText',
      isComposing: true,
    });

    expect(inputEvent.data).toBe('a');
    expect(inputEvent.inputType).toBe('insertText');
    expect(inputEvent.isComposing).toBe(true);
    expect(inputEvent.dataTransfer).toBeNull();
    expect(inputEvent.getTargetRanges()).toEqual([]);
    expect(new InputEventImplementation('input').data).toBeNull();
  });

  it('should expose wheel event deltas and delta mode constants', () => {
    const { globalScope } = createInstalledScope();
    const WheelEventImplementation = readEventClass<typeof WheelEvent>(
      globalScope,
      'WheelEvent',
    );

    const wheelEvent = new WheelEventImplementation('wheel', {
      deltaY: -3,
      deltaMode: WheelEventImplementation.DOM_DELTA_LINE,
    });

    expect(wheelEvent).toBeInstanceOf(globalScope.MouseEvent);
    expect(wheelEvent.deltaX).toBe(0);
    expect(wheelEvent.deltaY).toBe(-3);
    expect(wheelEvent.deltaMode).toBe(1);
    expect(WheelEventImplementation.DOM_DELTA_PAGE).toBe(2);
  });
});

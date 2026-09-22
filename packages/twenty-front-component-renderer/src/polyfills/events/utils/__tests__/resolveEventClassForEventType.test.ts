import { resolveEventClassForEventType } from '../resolveEventClassForEventType';

describe('resolveEventClassForEventType', () => {
  const createEventClassScope = () => ({
    Event: class ScopedEvent {},
    ClipboardEvent: class ScopedClipboardEvent {},
    FocusEvent: class ScopedFocusEvent {},
    InputEvent: class ScopedInputEvent {},
    KeyboardEvent: class ScopedKeyboardEvent {},
    MouseEvent: class ScopedMouseEvent {},
    PointerEvent: class ScopedPointerEvent {},
    WheelEvent: class ScopedWheelEvent {},
  });

  it.each([
    ['click', 'PointerEvent'],
    ['contextmenu', 'PointerEvent'],
    ['pointerdown', 'PointerEvent'],
    ['dblclick', 'MouseEvent'],
    ['mousedown', 'MouseEvent'],
    ['dragover', 'MouseEvent'],
    ['keydown', 'KeyboardEvent'],
    ['beforeinput', 'InputEvent'],
    ['wheel', 'WheelEvent'],
    ['focusin', 'FocusEvent'],
    ['paste', 'ClipboardEvent'],
    ['change', 'Event'],
    ['touchstart', 'Event'],
  ])('should resolve %s to the scoped %s class', (eventType, className) => {
    const eventClassScope = createEventClassScope();

    expect(resolveEventClassForEventType({ eventType, eventClassScope })).toBe(
      eventClassScope[className as keyof typeof eventClassScope],
    );
  });

  it('should fall back to the scoped base event class when the typed class is missing', () => {
    const eventClassScope = { Event: class ScopedEvent {} };

    expect(
      resolveEventClassForEventType({
        eventType: 'pointerdown',
        eventClassScope,
      }),
    ).toBe(eventClassScope.Event);
  });

  it('should fall back to the global event class when the scope has none', () => {
    expect(
      resolveEventClassForEventType({
        eventType: 'click',
        eventClassScope: {},
      }),
    ).toBe(Event);
  });
});

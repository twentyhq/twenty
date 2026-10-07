import { type PointerEvent } from 'react';

import { createResizableSeparatorProps } from '../createResizableSeparatorProps';

type SeparatorHandlers = Record<
  | 'onMouseDown'
  | 'onPointerDown'
  | 'onPointerUp'
  | 'onPointerCancel'
  | 'onLostPointerCapture'
  | 'onKeyDown',
  (event: unknown) => void
>;

const createSeparatorElement = () => {
  const capturedPointerIds = new Set<number>();

  return Object.assign(document.createElement('div'), {
    setPointerCapture: jest.fn((pointerId: number) =>
      capturedPointerIds.add(pointerId),
    ),
    hasPointerCapture: jest.fn((pointerId: number) =>
      capturedPointerIds.has(pointerId),
    ),
    releasePointerCapture: jest.fn((pointerId: number) =>
      capturedPointerIds.delete(pointerId),
    ),
  });
};

const createPointerEvent = (
  currentTarget: HTMLElement,
  { pointerId = 1, button = 0 }: { pointerId?: number; button?: number } = {},
) =>
  ({
    button,
    defaultPrevented: false,
    pointerId,
    currentTarget,
    preventDefault: jest.fn(),
  }) as unknown as PointerEvent<HTMLElement>;

const createSeparatorHandlers = (remoteProps: Record<string, unknown> = {}) => {
  const remotePointerCancel = jest.fn();
  const handlers = createResizableSeparatorProps({
    role: 'separator',
    'aria-valuenow': 50,
    onPointerDown: jest.fn(),
    onPointerUp: jest.fn(),
    onPointerCancel: remotePointerCancel,
    ...remoteProps,
  }) as SeparatorHandlers;

  return { handlers, remotePointerCancel };
};

describe('createResizableSeparatorProps', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('should not apply to elements that are not enabled value separators', () => {
    expect(
      createResizableSeparatorProps({
        role: 'separator',
        onPointerDown: jest.fn(),
      }),
    ).toBeUndefined();
    expect(
      createResizableSeparatorProps({
        role: 'separator',
        'aria-valuenow': 50,
        'aria-disabled': 'true',
        onPointerDown: jest.fn(),
      }),
    ).toBeUndefined();
  });

  it('should forward a cancel when the separator loses the pointer capture mid-drag', () => {
    const { handlers, remotePointerCancel } = createSeparatorHandlers();
    const separator = createSeparatorElement();

    handlers.onPointerDown(createPointerEvent(separator));
    handlers.onLostPointerCapture(createPointerEvent(separator));

    expect(remotePointerCancel).toHaveBeenCalledTimes(1);
  });

  it('should not forward a cancel for the capture released when the drag ends', () => {
    const { handlers, remotePointerCancel } = createSeparatorHandlers();
    const separator = createSeparatorElement();

    handlers.onPointerDown(createPointerEvent(separator));
    handlers.onPointerUp(createPointerEvent(separator));
    handlers.onLostPointerCapture(createPointerEvent(separator));

    expect(remotePointerCancel).not.toHaveBeenCalled();
    expect(separator.releasePointerCapture).toHaveBeenCalledWith(1);
  });

  it('should forward a real cancel once, without a second one for the released capture', () => {
    const { handlers, remotePointerCancel } = createSeparatorHandlers();
    const separator = createSeparatorElement();

    handlers.onPointerDown(createPointerEvent(separator));
    handlers.onPointerCancel(createPointerEvent(separator));
    handlers.onLostPointerCapture(createPointerEvent(separator));

    expect(remotePointerCancel).toHaveBeenCalledTimes(1);
  });

  it('should still forward the drag pointer losing its capture after another pointer ended on the separator', () => {
    const { handlers, remotePointerCancel } = createSeparatorHandlers();
    const separator = createSeparatorElement();

    handlers.onPointerDown(createPointerEvent(separator));
    handlers.onPointerDown(
      createPointerEvent(separator, { pointerId: 2, button: 2 }),
    );
    handlers.onPointerUp(createPointerEvent(separator, { pointerId: 2 }));
    handlers.onLostPointerCapture(createPointerEvent(separator));

    expect(remotePointerCancel).toHaveBeenCalledTimes(1);
  });
  it('should keep focus where it is when the separator is pressed', () => {
    const onMouseDown = jest.fn();
    const { handlers } = createSeparatorHandlers({ onMouseDown });
    const event = { preventDefault: jest.fn() };

    handlers.onMouseDown(event);

    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(onMouseDown).toHaveBeenCalledWith(event);
  });

  it('should capture the pointer without focusing the separator', () => {
    const onPointerDown = jest.fn();
    const { handlers } = createSeparatorHandlers({ onPointerDown });
    const separator = createSeparatorElement();
    const event = createPointerEvent(separator);

    separator.tabIndex = 0;
    document.body.append(separator);
    handlers.onPointerDown(event);

    expect(separator.hasPointerCapture(1)).toBe(true);
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(document.activeElement).not.toBe(separator);
    expect(onPointerDown).toHaveBeenCalledWith(event);
  });

  it('should prevent the host default for separator keys without modifiers', () => {
    const onKeyDown = jest.fn();
    const { handlers } = createSeparatorHandlers({ onKeyDown });
    const createKeyDownEvent = (key: string, metaKey = false) => ({
      key,
      metaKey,
      altKey: false,
      ctrlKey: false,
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
    });
    const spaceEvent = createKeyDownEvent(' ');
    const shortcutEvent = createKeyDownEvent('ArrowLeft', true);
    const enterEvent = createKeyDownEvent('Enter');

    for (const event of [spaceEvent, shortcutEvent, enterEvent]) {
      handlers.onKeyDown(event);
    }

    expect(spaceEvent.preventDefault).toHaveBeenCalledTimes(1);
    expect(spaceEvent.stopPropagation).toHaveBeenCalledTimes(1);
    expect(shortcutEvent.preventDefault).not.toHaveBeenCalled();
    expect(enterEvent.preventDefault).not.toHaveBeenCalled();
    expect(onKeyDown).toHaveBeenCalledTimes(3);
  });

  it('should cancel the remote drag on Escape while the pointer is captured', () => {
    const { handlers, remotePointerCancel } = createSeparatorHandlers();
    const separator = createSeparatorElement();
    const handleDocumentKeyDown = jest.fn();

    document.addEventListener('keydown', handleDocumentKeyDown);
    handlers.onPointerDown(createPointerEvent(separator));

    const escapeEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    });
    document.body.dispatchEvent(escapeEvent);

    expect(escapeEvent.defaultPrevented).toBe(true);
    expect(handleDocumentKeyDown).not.toHaveBeenCalled();
    expect(separator.hasPointerCapture(1)).toBe(false);
    expect(remotePointerCancel).toHaveBeenCalledWith({
      type: 'pointercancel',
      pointerId: 1,
    });

    document.body.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );

    expect(handleDocumentKeyDown).toHaveBeenCalledTimes(1);
    expect(remotePointerCancel).toHaveBeenCalledTimes(1);
    document.removeEventListener('keydown', handleDocumentKeyDown);
  });
});

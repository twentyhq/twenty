import { createResizableSeparatorProps } from '../createResizableSeparatorProps';

type SeparatorHandler = (event: unknown) => void;

const createCapturingSeparator = () => {
  const separator = document.createElement('div');
  const capturedPointers = new Set<number>();

  separator.tabIndex = 0;
  separator.setPointerCapture = (pointerId) => {
    capturedPointers.add(pointerId);
  };
  separator.hasPointerCapture = (pointerId) => capturedPointers.has(pointerId);
  separator.releasePointerCapture = (pointerId) => {
    capturedPointers.delete(pointerId);
  };
  document.body.append(separator);

  return separator;
};

const createSeparatorProps = (remoteProps: Record<string, unknown> = {}) =>
  createResizableSeparatorProps({
    role: 'separator',
    'aria-valuenow': 100,
    onPointerDown: jest.fn(),
    ...remoteProps,
  });

describe('createResizableSeparatorProps', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('should return undefined for a disabled separator', () => {
    expect(createSeparatorProps({ 'aria-disabled': 'true' })).toBeUndefined();
  });

  it('should keep focus where it is when the separator is pressed', () => {
    const onMouseDown = jest.fn();
    const props = createSeparatorProps({ onMouseDown });
    const event = { preventDefault: jest.fn() };

    (props?.onMouseDown as SeparatorHandler)(event);

    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(onMouseDown).toHaveBeenCalledWith(event);
  });

  it('should capture the pointer without focusing the separator', () => {
    const separator = createCapturingSeparator();
    const onPointerDown = jest.fn();
    const props = createSeparatorProps({ onPointerDown });
    const event = {
      button: 0,
      defaultPrevented: false,
      pointerId: 1,
      currentTarget: separator,
      preventDefault: jest.fn(),
    };

    (props?.onPointerDown as SeparatorHandler)(event);

    expect(separator.hasPointerCapture(1)).toBe(true);
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(document.activeElement).not.toBe(separator);
    expect(onPointerDown).toHaveBeenCalledWith(event);
  });

  it('should prevent the host default for separator keys without modifiers', () => {
    const onKeyDown = jest.fn();
    const props = createSeparatorProps({ onKeyDown });
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
      (props?.onKeyDown as SeparatorHandler)(event);
    }

    expect(spaceEvent.preventDefault).toHaveBeenCalledTimes(1);
    expect(spaceEvent.stopPropagation).toHaveBeenCalledTimes(1);
    expect(shortcutEvent.preventDefault).not.toHaveBeenCalled();
    expect(enterEvent.preventDefault).not.toHaveBeenCalled();
    expect(onKeyDown).toHaveBeenCalledTimes(3);
  });

  it('should cancel the remote drag on Escape while the pointer is captured', () => {
    const separator = createCapturingSeparator();
    const onPointerCancel = jest.fn();
    const handleDocumentKeyDown = jest.fn();
    const props = createSeparatorProps({ onPointerCancel });

    document.addEventListener('keydown', handleDocumentKeyDown);
    (props?.onPointerDown as SeparatorHandler)({
      button: 0,
      defaultPrevented: false,
      pointerId: 1,
      currentTarget: separator,
    });

    const escapeEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    });
    document.body.dispatchEvent(escapeEvent);

    expect(escapeEvent.defaultPrevented).toBe(true);
    expect(handleDocumentKeyDown).not.toHaveBeenCalled();
    expect(separator.hasPointerCapture(1)).toBe(false);
    expect(onPointerCancel).toHaveBeenCalledWith({
      type: 'pointercancel',
      pointerId: 1,
    });

    document.body.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );

    expect(handleDocumentKeyDown).toHaveBeenCalledTimes(1);
    expect(onPointerCancel).toHaveBeenCalledTimes(1);
    document.removeEventListener('keydown', handleDocumentKeyDown);
  });
});

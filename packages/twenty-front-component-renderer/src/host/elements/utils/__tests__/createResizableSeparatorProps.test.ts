import { type PointerEvent } from 'react';

import { createResizableSeparatorProps } from '../createResizableSeparatorProps';

type SeparatorHandlers = Record<
  'onPointerDown' | 'onPointerUp' | 'onPointerCancel' | 'onLostPointerCapture',
  (event: PointerEvent<HTMLElement>) => void
>;

const createSeparatorElement = () =>
  Object.assign(document.createElement('div'), {
    setPointerCapture: jest.fn(),
    hasPointerCapture: jest.fn(() => true),
    releasePointerCapture: jest.fn(),
  });

const createPointerEvent = (currentTarget: HTMLElement) =>
  ({
    button: 0,
    defaultPrevented: false,
    pointerId: 1,
    currentTarget,
    preventDefault: jest.fn(),
  }) as unknown as PointerEvent<HTMLElement>;

const createSeparatorHandlers = () => {
  const remotePointerCancel = jest.fn();
  const handlers = createResizableSeparatorProps({
    role: 'separator',
    'aria-valuenow': 50,
    onPointerDown: jest.fn(),
    onPointerUp: jest.fn(),
    onPointerCancel: remotePointerCancel,
  }) as SeparatorHandlers;

  return { handlers, remotePointerCancel };
};

describe('createResizableSeparatorProps', () => {
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
});

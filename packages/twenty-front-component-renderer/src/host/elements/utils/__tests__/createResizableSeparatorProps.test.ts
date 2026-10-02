import { type PointerEvent } from 'react';

import { createResizableSeparatorProps } from '../createResizableSeparatorProps';

type SeparatorHandlers = Record<
  'onPointerDown' | 'onPointerUp' | 'onPointerCancel' | 'onLostPointerCapture',
  (event: PointerEvent<HTMLElement>) => void
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
});

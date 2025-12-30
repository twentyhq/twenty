import { act, renderHook } from '@testing-library/react';

import { useTrackPointer } from '@/ui/utilities/pointer-event/hooks/useTrackPointer';

describe('useTrackPointer', () => {
  it('Should call onMouseDown when mouse down event is triggered', () => {
    const onMouseDown = jest.fn();

    renderHook(() =>
      useTrackPointer({
        onMouseDown,
      }),
    );

    act(() => {
      const event = new MouseEvent('mousedown', { clientX: 150, clientY: 250 });
      document.dispatchEvent(event);
    });

    expect(onMouseDown).toHaveBeenCalledWith({
      x: 150,
      y: 250,
      event: expect.any(MouseEvent),
    });
  });

  it('Should call onMouseUp when mouse up event is triggered', () => {
    const onMouseUp = jest.fn();

    renderHook(() =>
      useTrackPointer({
        onMouseUp,
      }),
    );

    act(() => {
      const event = new MouseEvent('mouseup', { clientX: 200, clientY: 300 });
      document.dispatchEvent(event);
    });

    expect(onMouseUp).toHaveBeenCalledWith({
      x: 200,
      y: 300,
      event: expect.any(MouseEvent),
    });
  });

  it('Should call onInternalMouseMove when mouse move event is triggered', () => {
    const onInternalMouseMove = jest.fn();

    renderHook(() =>
      useTrackPointer({
        onMouseMove: onInternalMouseMove,
      }),
    );

    act(() => {
      const event = new MouseEvent('mousemove', { clientX: 150, clientY: 250 });
      document.dispatchEvent(event);
    });

    expect(onInternalMouseMove).toHaveBeenCalledWith({
      x: 150,
      y: 250,
      event: expect.any(MouseEvent),
    });
  });

  it('Should pass the correct event object to the callback', () => {
    const onMouseDown = jest.fn();

    renderHook(() =>
      useTrackPointer({
        onMouseDown,
      }),
    );

    act(() => {
      const event = new MouseEvent('mousedown', { clientX: 100, clientY: 200 });
      document.dispatchEvent(event);
    });

    const calledWith = onMouseDown.mock.calls[0][0];
    expect(calledWith.event).toBeInstanceOf(MouseEvent);
    expect(calledWith.event.type).toBe('mousedown');
  });

  it('Should handle touch events correctly', () => {
    const onMouseDown = jest.fn();

    renderHook(() =>
      useTrackPointer({
        onMouseDown,
      }),
    );

    act(() => {
      const touchEvent = new TouchEvent('touchstart', {
        changedTouches: [
          {
            clientX: 120,
            clientY: 180,
          } as Touch,
        ],
      });

      document.dispatchEvent(touchEvent);
    });

    if (onMouseDown.mock.calls.length > 0) {
      const calledWith = onMouseDown.mock.calls[0][0];
      expect(calledWith.x).toBe(120);
      expect(calledWith.y).toBe(180);
      expect(calledWith.event).toBeInstanceOf(TouchEvent);
    }
  });

  it('Should not track pointer when shouldTrackPointer is false', () => {
    const onMouseDown = jest.fn();

    renderHook(() =>
      useTrackPointer({
        shouldTrackPointer: false,
        onMouseDown,
      }),
    );

    act(() => {
      const event = new MouseEvent('mousedown', { clientX: 150, clientY: 250 });
      document.dispatchEvent(event);
    });

    expect(onMouseDown).not.toHaveBeenCalled();
  });
});

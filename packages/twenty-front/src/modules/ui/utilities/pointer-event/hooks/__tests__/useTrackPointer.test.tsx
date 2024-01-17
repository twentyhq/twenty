import { act, renderHook } from '@testing-library/react';

import { useTrackPointer } from '../useTrackPointer';

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

    expect(onMouseDown).toHaveBeenCalledWith(150, 250);
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

    expect(onMouseUp).toHaveBeenCalledWith(200, 300);
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

    expect(onInternalMouseMove).toHaveBeenCalledWith(150, 250);
  });
});

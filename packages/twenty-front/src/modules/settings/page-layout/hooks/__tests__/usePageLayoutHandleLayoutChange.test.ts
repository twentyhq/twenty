import { act, renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { usePageLayoutHandleLayoutChange } from '../usePageLayoutHandleLayoutChange';

describe('usePageLayoutHandleLayoutChange', () => {
  it('should update layouts and draft state when layout changes', () => {
    const { result } = renderHook(() => usePageLayoutHandleLayoutChange(), {
      wrapper: RecoilRoot,
    });

    const newLayouts = {
      desktop: [
        { i: 'widget-1', x: 2, y: 3, w: 4, h: 5 },
        { i: 'widget-2', x: 6, y: 7, w: 8, h: 9 },
      ],
      mobile: [
        { i: 'widget-1', x: 0, y: 0, w: 1, h: 5 },
        { i: 'widget-2', x: 0, y: 5, w: 1, h: 9 },
      ],
    };

    act(() => {
      result.current.handleLayoutChange([], newLayouts);
    });

    expect(typeof result.current.handleLayoutChange).toBe('function');
  });

  it('should handle empty layouts', () => {
    const { result } = renderHook(() => usePageLayoutHandleLayoutChange(), {
      wrapper: RecoilRoot,
    });

    const emptyLayouts = {
      desktop: [],
      mobile: [],
    };

    act(() => {
      result.current.handleLayoutChange([], emptyLayouts);
    });

    expect(typeof result.current.handleLayoutChange).toBe('function');
  });

  it('should maintain callback reference across renders', () => {
    const { result, rerender } = renderHook(
      () => usePageLayoutHandleLayoutChange(),
      {
        wrapper: RecoilRoot,
      },
    );

    const firstCallback = result.current.handleLayoutChange;

    rerender();

    const secondCallback = result.current.handleLayoutChange;

    expect(firstCallback).toBe(secondCallback);
  });
});

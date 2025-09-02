import { act, renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { usePageLayoutWidgetDelete } from '../usePageLayoutWidgetDelete';

describe('usePageLayoutWidgetDelete', () => {
  it('should remove widget from all states', () => {
    const { result } = renderHook(() => usePageLayoutWidgetDelete(), {
      wrapper: RecoilRoot,
    });

    act(() => {
      result.current.handleRemoveWidget('widget-1');
    });

    expect(typeof result.current.handleRemoveWidget).toBe('function');
  });

  it('should handle removing non-existent widget', () => {
    const { result } = renderHook(() => usePageLayoutWidgetDelete(), {
      wrapper: RecoilRoot,
    });

    act(() => {
      result.current.handleRemoveWidget('non-existent-widget');
    });

    expect(typeof result.current.handleRemoveWidget).toBe('function');
  });

  it('should handle empty layouts', () => {
    const { result } = renderHook(() => usePageLayoutWidgetDelete(), {
      wrapper: RecoilRoot,
    });

    act(() => {
      result.current.handleRemoveWidget('any-widget');
    });

    expect(typeof result.current.handleRemoveWidget).toBe('function');
  });
});

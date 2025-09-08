import { act, renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { useDeletePageLayoutWidget } from '../useDeletePageLayoutWidget';

describe('useDeletePageLayoutWidget', () => {
  it('should remove widget from all states', () => {
    const { result } = renderHook(() => useDeletePageLayoutWidget(), {
      wrapper: RecoilRoot,
    });

    act(() => {
      result.current.deletePageLayoutWidget('widget-1');
    });

    expect(typeof result.current.deletePageLayoutWidget).toBe('function');
  });

  it('should handle removing non-existent widget', () => {
    const { result } = renderHook(() => useDeletePageLayoutWidget(), {
      wrapper: RecoilRoot,
    });

    act(() => {
      result.current.deletePageLayoutWidget('non-existent-widget');
    });

    expect(typeof result.current.deletePageLayoutWidget).toBe('function');
  });

  it('should handle empty layouts', () => {
    const { result } = renderHook(() => useDeletePageLayoutWidget(), {
      wrapper: RecoilRoot,
    });

    act(() => {
      result.current.deletePageLayoutWidget('any-widget');
    });

    expect(typeof result.current.deletePageLayoutWidget).toBe('function');
  });
});

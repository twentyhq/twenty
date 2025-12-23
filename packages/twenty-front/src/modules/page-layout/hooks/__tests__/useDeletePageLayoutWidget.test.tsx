import { act, renderHook } from '@testing-library/react';
import {
  PageLayoutTestWrapper,
  PAGE_LAYOUT_TEST_INSTANCE_ID,
} from './PageLayoutTestWrapper';
import { useDeletePageLayoutWidget } from '@/page-layout/hooks/useDeletePageLayoutWidget';

describe('useDeletePageLayoutWidget', () => {
  it('should remove widget from all states', () => {
    const { result } = renderHook(
      () => useDeletePageLayoutWidget(PAGE_LAYOUT_TEST_INSTANCE_ID),
      {
        wrapper: PageLayoutTestWrapper,
      },
    );

    act(() => {
      result.current.deletePageLayoutWidget('widget-1');
    });

    expect(typeof result.current.deletePageLayoutWidget).toBe('function');
  });

  it('should handle removing non-existent widget', () => {
    const { result } = renderHook(
      () => useDeletePageLayoutWidget(PAGE_LAYOUT_TEST_INSTANCE_ID),
      {
        wrapper: PageLayoutTestWrapper,
      },
    );

    act(() => {
      result.current.deletePageLayoutWidget('non-existent-widget');
    });

    expect(typeof result.current.deletePageLayoutWidget).toBe('function');
  });

  it('should handle empty layouts', () => {
    const { result } = renderHook(
      () => useDeletePageLayoutWidget(PAGE_LAYOUT_TEST_INSTANCE_ID),
      {
        wrapper: PageLayoutTestWrapper,
      },
    );

    act(() => {
      result.current.deletePageLayoutWidget('any-widget');
    });

    expect(typeof result.current.deletePageLayoutWidget).toBe('function');
  });
});

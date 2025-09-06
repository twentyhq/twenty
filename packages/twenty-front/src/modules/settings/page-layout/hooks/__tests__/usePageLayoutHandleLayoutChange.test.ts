import { act, renderHook } from '@testing-library/react';
import { RecoilRoot, useRecoilValue } from 'recoil';
import { pageLayoutCurrentLayoutsState } from '../../states/pageLayoutCurrentLayoutsState';
import { usePageLayoutHandleLayoutChange } from '../usePageLayoutHandleLayoutChange';

describe('usePageLayoutHandleLayoutChange', () => {
  it('should update layouts for specific tab only', () => {
    const { result } = renderHook(
      () => ({
        handler: usePageLayoutHandleLayoutChange('tab-1'),
        layouts: useRecoilValue(pageLayoutCurrentLayoutsState),
      }),
      {
        wrapper: RecoilRoot,
      },
    );

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
      result.current.handler.handleLayoutChange([], newLayouts);
    });

    expect(result.current.layouts['tab-1']).toEqual(newLayouts);
    expect(result.current.layouts['tab-2']).toBeUndefined();
  });

  it('should isolate layouts between different tabs', () => {
    const { result, rerender } = renderHook(
      ({ tabId }) => ({
        handler: usePageLayoutHandleLayoutChange(tabId),
        layouts: useRecoilValue(pageLayoutCurrentLayoutsState),
      }),
      {
        wrapper: RecoilRoot,
        initialProps: { tabId: 'tab-1' },
      },
    );

    const tab1Layouts = {
      desktop: [{ i: 'widget-1', x: 0, y: 0, w: 2, h: 2 }],
      mobile: [{ i: 'widget-1', x: 0, y: 0, w: 1, h: 2 }],
    };

    act(() => {
      result.current.handler.handleLayoutChange([], tab1Layouts);
    });

    rerender({ tabId: 'tab-2' });

    const tab2Layouts = {
      desktop: [{ i: 'widget-2', x: 4, y: 4, w: 3, h: 3 }],
      mobile: [{ i: 'widget-2', x: 0, y: 0, w: 1, h: 3 }],
    };

    act(() => {
      result.current.handler.handleLayoutChange([], tab2Layouts);
    });

    expect(result.current.layouts['tab-1']).toEqual(tab1Layouts);
    expect(result.current.layouts['tab-2']).toEqual(tab2Layouts);
  });

  it('should not update layouts when activeTabId is null', () => {
    const { result } = renderHook(
      () => ({
        handler: usePageLayoutHandleLayoutChange(null),
        layouts: useRecoilValue(pageLayoutCurrentLayoutsState),
      }),
      {
        wrapper: RecoilRoot,
      },
    );

    const newLayouts = {
      desktop: [{ i: 'widget-1', x: 0, y: 0, w: 2, h: 2 }],
      mobile: [{ i: 'widget-1', x: 0, y: 0, w: 1, h: 2 }],
    };

    act(() => {
      result.current.handler.handleLayoutChange([], newLayouts);
    });

    expect(Object.keys(result.current.layouts)).toHaveLength(0);
  });
});

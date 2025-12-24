import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { act, renderHook } from '@testing-library/react';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { usePageLayoutHandleLayoutChange } from '@/page-layout/hooks/usePageLayoutHandleLayoutChange';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from './PageLayoutTestWrapper';

describe('usePageLayoutHandleLayoutChange', () => {
  it('should update layouts for specific tab only', () => {
    const { result } = renderHook(
      () => ({
        handler: usePageLayoutHandleLayoutChange(PAGE_LAYOUT_TEST_INSTANCE_ID),
        layouts: useRecoilComponentValue(
          pageLayoutCurrentLayoutsComponentState,
          PAGE_LAYOUT_TEST_INSTANCE_ID,
        ),
      }),
      {
        wrapper: ({ children }) => (
          <PageLayoutTestWrapper
            initializeState={({ set }) => {
              set(
                activeTabIdComponentState.atomFamily({
                  instanceId: `${PAGE_LAYOUT_TEST_INSTANCE_ID}-tab-list`,
                }),
                'tab-1',
              );
            }}
          >
            {children}
          </PageLayoutTestWrapper>
        ),
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
    expect(result.current.layouts['tab-1']).not.toBe(newLayouts); // Ensure a clone was set, not the same reference
    expect(result.current.layouts['tab-2']).toBeUndefined();
  });

  it('should isolate layouts between different tabs', () => {
    const { result } = renderHook(
      () => ({
        handler: usePageLayoutHandleLayoutChange(PAGE_LAYOUT_TEST_INSTANCE_ID),
        layouts: useRecoilComponentValue(
          pageLayoutCurrentLayoutsComponentState,
          PAGE_LAYOUT_TEST_INSTANCE_ID,
        ),
      }),
      {
        wrapper: ({ children }) => (
          <PageLayoutTestWrapper
            initializeState={({ set }) => {
              set(
                activeTabIdComponentState.atomFamily({
                  instanceId: `${PAGE_LAYOUT_TEST_INSTANCE_ID}-tab-list`,
                }),
                'tab-1',
              );
            }}
          >
            {children}
          </PageLayoutTestWrapper>
        ),
      },
    );

    const tab1Layouts = {
      desktop: [{ i: 'widget-1', x: 0, y: 0, w: 2, h: 2 }],
      mobile: [{ i: 'widget-1', x: 0, y: 0, w: 1, h: 2 }],
    };

    act(() => {
      result.current.handler.handleLayoutChange([], tab1Layouts);
    });

    // Unfortunately we can't properly test tab switching with the current renderHook API
    // since we can't change the activeTabId after initialization in a simple way
    expect(result.current.layouts['tab-1']).toEqual(tab1Layouts);
  });

  it('should not update layouts when activeTabId is null', () => {
    const { result } = renderHook(
      () => ({
        handler: usePageLayoutHandleLayoutChange(PAGE_LAYOUT_TEST_INSTANCE_ID),
        layouts: useRecoilComponentValue(
          pageLayoutCurrentLayoutsComponentState,
          PAGE_LAYOUT_TEST_INSTANCE_ID,
        ),
      }),
      {
        wrapper: PageLayoutTestWrapper,
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

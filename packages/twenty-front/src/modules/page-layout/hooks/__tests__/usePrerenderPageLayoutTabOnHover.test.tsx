import { act, renderHook } from '@testing-library/react';

import { PAGE_LAYOUT_TAB_PRERENDER_HOVER_INTENT_DELAY_MS } from '@/page-layout/constants/PageLayoutTabPrerenderHoverIntentDelayMs';
import { usePrerenderPageLayoutTabOnHover } from '@/page-layout/hooks/usePrerenderPageLayoutTabOnHover';
import { pageLayoutPrerenderedTabIdsComponentState } from '@/page-layout/states/pageLayoutPrerenderedTabIdsComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { PageLayoutTestWrapper } from './PageLayoutTestWrapper';

describe('usePrerenderPageLayoutTabOnHover', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const renderHoverHook = () =>
    renderHook(
      () => ({
        hover: usePrerenderPageLayoutTabOnHover(),
        pageLayoutPrerenderedTabIds: useAtomComponentStateValue(
          pageLayoutPrerenderedTabIdsComponentState,
        ),
      }),
      { wrapper: PageLayoutTestWrapper },
    );

  it('prerenders a tab only after the hover intent delay', () => {
    const { result } = renderHoverHook();

    act(() => {
      result.current.hover.handleTabMouseEnter('tab-1');
    });

    act(() => {
      jest.advanceTimersByTime(
        PAGE_LAYOUT_TAB_PRERENDER_HOVER_INTENT_DELAY_MS - 1,
      );
    });

    expect(result.current.pageLayoutPrerenderedTabIds).toEqual([]);

    act(() => {
      jest.advanceTimersByTime(1);
    });

    expect(result.current.pageLayoutPrerenderedTabIds).toEqual(['tab-1']);
  });

  it('does not prerender when the cursor leaves before the delay', () => {
    const { result } = renderHoverHook();

    act(() => {
      result.current.hover.handleTabMouseEnter('tab-1');
      result.current.hover.handleTabMouseLeave();
    });

    act(() => {
      jest.advanceTimersByTime(PAGE_LAYOUT_TAB_PRERENDER_HOVER_INTENT_DELAY_MS);
    });

    expect(result.current.pageLayoutPrerenderedTabIds).toEqual([]);
  });

  it('only prerenders the last tab of a quick hover trail', () => {
    const { result } = renderHoverHook();

    act(() => {
      result.current.hover.handleTabMouseEnter('tab-1');
      result.current.hover.handleTabMouseLeave();
      result.current.hover.handleTabMouseEnter('tab-2');
    });

    act(() => {
      jest.advanceTimersByTime(PAGE_LAYOUT_TAB_PRERENDER_HOVER_INTENT_DELAY_MS);
    });

    expect(result.current.pageLayoutPrerenderedTabIds).toEqual(['tab-2']);
  });
});

import { act, renderHook } from '@testing-library/react';

import { usePrerenderPageLayoutTab } from '@/page-layout/hooks/usePrerenderPageLayoutTab';
import { pageLayoutPrerenderedTabIdsComponentState } from '@/page-layout/states/pageLayoutPrerenderedTabIdsComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { PageLayoutTestWrapper } from './PageLayoutTestWrapper';

describe('usePrerenderPageLayoutTab', () => {
  const renderPrerenderHook = () =>
    renderHook(
      () => ({
        prerender: usePrerenderPageLayoutTab(),
        pageLayoutPrerenderedTabIds: useAtomComponentStateValue(
          pageLayoutPrerenderedTabIdsComponentState,
        ),
      }),
      { wrapper: PageLayoutTestWrapper },
    );

  it('appends hovered tabs most recent last without duplicates', () => {
    const { result } = renderPrerenderHook();

    act(() => {
      result.current.prerender.prerenderPageLayoutTab('tab-1');
      result.current.prerender.prerenderPageLayoutTab('tab-2');
      result.current.prerender.prerenderPageLayoutTab('tab-1');
      result.current.prerender.prerenderPageLayoutTab('tab-1');
    });

    expect(result.current.pageLayoutPrerenderedTabIds).toEqual([
      'tab-2',
      'tab-1',
    ]);
  });

  it('evicts the oldest tab beyond the cap', () => {
    const { result } = renderPrerenderHook();

    act(() => {
      result.current.prerender.prerenderPageLayoutTab('tab-1');
      result.current.prerender.prerenderPageLayoutTab('tab-2');
      result.current.prerender.prerenderPageLayoutTab('tab-3');
      result.current.prerender.prerenderPageLayoutTab('tab-4');
    });

    expect(result.current.pageLayoutPrerenderedTabIds).toEqual([
      'tab-2',
      'tab-3',
      'tab-4',
    ]);
  });
});

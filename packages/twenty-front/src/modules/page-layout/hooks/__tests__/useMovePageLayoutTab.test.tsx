import { useMovePageLayoutTab } from '@/page-layout/hooks/useMovePageLayoutTab';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import {
  makeDraft,
  makeTab,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { sortTabsByPosition } from '@/page-layout/utils/sortTabsByPosition';
import { act, renderHook } from '@testing-library/react';
import { createStore } from 'jotai';
import { type ReactNode } from 'react';

import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from './PageLayoutTestWrapper';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';

const renderUseMovePageLayoutTab = (tabs: ReturnType<typeof makeTab>[]) => {
  const store = createStore();

  store.set(
    pageLayoutDraftComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
    }),
    makeDraft(tabs),
  );

  const { result } = renderHook(() => useMovePageLayoutTab(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <PageLayoutTestWrapper store={store}>{children}</PageLayoutTestWrapper>
    ),
  });

  const getActiveTabIds = () =>
    sortTabsByPosition(
      store
        .get(
          pageLayoutDraftComponentState.atomFamily({
            instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
            surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
          }),
        )
        .tabs.filter((tab) => tab.isActive),
    ).map((tab) => tab.id);

  return { result, getActiveTabIds };
};

describe('useMovePageLayoutTab', () => {
  it('should swap a tab with its left neighbor', () => {
    const { result, getActiveTabIds } = renderUseMovePageLayoutTab([
      makeTab('tab-1', [], 0),
      makeTab('tab-2', [], 1),
    ]);

    act(() => result.current.moveLeft('tab-2'));

    expect(getActiveTabIds()).toEqual(['tab-2', 'tab-1']);
  });

  it('should swap a tab with its right neighbor', () => {
    const { result, getActiveTabIds } = renderUseMovePageLayoutTab([
      makeTab('tab-1', [], 0),
      makeTab('tab-2', [], 1),
    ]);

    act(() => result.current.moveRight('tab-1'));

    expect(getActiveTabIds()).toEqual(['tab-2', 'tab-1']);
  });

  it('should skip a deleted tab standing between two rendered tabs', () => {
    const { result, getActiveTabIds } = renderUseMovePageLayoutTab([
      makeTab('tab-1', [], 0),
      makeTab('deleted-tab', [], 1, undefined, { isActive: false }),
      makeTab('tab-3', [], 2),
    ]);

    act(() => result.current.moveLeft('tab-3'));

    expect(getActiveTabIds()).toEqual(['tab-3', 'tab-1']);
  });

  it('should leave the first and last rendered tabs where they are', () => {
    const { result, getActiveTabIds } = renderUseMovePageLayoutTab([
      makeTab('tab-1', [], 0),
      makeTab('tab-2', [], 1),
    ]);

    act(() => result.current.moveLeft('tab-1'));
    act(() => result.current.moveRight('tab-2'));

    expect(getActiveTabIds()).toEqual(['tab-1', 'tab-2']);
  });
});

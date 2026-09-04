import { useExecuteTasksOnAnyLocationChange } from '@/app/hooks/useExecuteTasksOnAnyLocationChange';
import { currentPageLayoutIdState } from '@/page-layout/states/currentPageLayoutIdState';
import { isDashboardInEditModeComponentState } from '@/page-layout/states/isDashboardInEditModeComponentState';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import {
  makeDraft,
  makeTab,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { toDraftPageLayout } from '@/page-layout/utils/toDraftPageLayout';
import { act, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';

const mockCloseAnyOpenDropdown = jest.fn();

jest.mock('@/ui/layout/dropdown/hooks/useCloseAnyOpenDropdown', () => ({
  useCloseAnyOpenDropdown: () => ({
    closeAnyOpenDropdown: mockCloseAnyOpenDropdown,
  }),
}));

const PAGE_LAYOUT_ID = 'test-page-layout-id';

const getWrapper =
  (store = createStore()) =>
  ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>{children}</JotaiProvider>
  );

describe('useExecuteTasksOnAnyLocationChange', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should reset page layout edit state when layout customization is inactive', () => {
    const store = createStore();
    const wrapper = getWrapper(store);
    const persistedPageLayout: PageLayout = {
      ...makeDraft([makeTab('tab-1', []), makeTab('tab-2', [], 1)]),
      id: PAGE_LAYOUT_ID,
      applicationId: 'application-id',
      universalIdentifier: 'page-layout-universal-identifier',
      isSystemSideEffect: false,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      deletedAt: null,
      isFirstTabPinned: false,
      defaultTabToFocusOnMobileAndSidePanelId: 'tab-1',
    };
    const draftState = pageLayoutDraftComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_ID,
      surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
    });

    store.set(
      pageLayoutPersistedComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_ID,
        surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
      }),
      persistedPageLayout,
    );
    store.set(draftState, {
      ...toDraftPageLayout(persistedPageLayout),
      isFirstTabPinned: true,
      defaultTabToFocusOnMobileAndSidePanelId: 'tab-2',
    });

    store.set(currentPageLayoutIdState.atom, PAGE_LAYOUT_ID);
    store.set(
      isDashboardInEditModeComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_ID,
        surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
      }),
      true,
    );
    store.set(isLayoutCustomizationModeEnabledState.atom, false);

    const { result } = renderHook(() => useExecuteTasksOnAnyLocationChange(), {
      wrapper,
    });

    act(() => {
      result.current.executeTasksOnAnyLocationChange();
    });

    expect(mockCloseAnyOpenDropdown).toHaveBeenCalledTimes(1);
    expect(store.get(currentPageLayoutIdState.atom)).toBeNull();
    expect(store.get(draftState)).toEqual(
      toDraftPageLayout(persistedPageLayout),
    );
    expect(
      store.get(
        isDashboardInEditModeComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_ID,
          surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
        }),
      ),
    ).toBe(false);
  });

  it('should not reset page layout edit state when layout customization is active', () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    store.set(currentPageLayoutIdState.atom, PAGE_LAYOUT_ID);
    store.set(
      isDashboardInEditModeComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_ID,
        surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
      }),
      true,
    );
    store.set(isLayoutCustomizationModeEnabledState.atom, true);

    const { result } = renderHook(() => useExecuteTasksOnAnyLocationChange(), {
      wrapper,
    });

    act(() => {
      result.current.executeTasksOnAnyLocationChange();
    });

    expect(mockCloseAnyOpenDropdown).toHaveBeenCalledTimes(1);
    expect(store.get(currentPageLayoutIdState.atom)).toBe(PAGE_LAYOUT_ID);
    expect(
      store.get(
        isDashboardInEditModeComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_ID,
          surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
        }),
      ),
    ).toBe(true);
  });
});

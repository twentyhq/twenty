import { useExecuteTasksOnAnyLocationChange } from '@/app/hooks/useExecuteTasksOnAnyLocationChange';
import { currentPageLayoutIdState } from '@/page-layout/states/currentPageLayoutIdState';
import { isDashboardInEditModeComponentState } from '@/page-layout/states/isDashboardInEditModeComponentState';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { act, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

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

    store.set(currentPageLayoutIdState.atom, PAGE_LAYOUT_ID);
    store.set(
      isDashboardInEditModeComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_ID,
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
    expect(
      store.get(
        isDashboardInEditModeComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_ID,
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
        }),
      ),
    ).toBe(true);
  });
});

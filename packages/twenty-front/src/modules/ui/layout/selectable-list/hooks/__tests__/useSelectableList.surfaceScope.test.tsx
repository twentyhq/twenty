import { act, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { WorkspaceSurfaceContext } from '@/ui/layout/contexts/WorkspaceSurfaceContext';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

const DROPDOWN_ID = 'sort-dropdown';
const SIDE_PANEL_INSTANCE_ID = 'side-panel-page';

const buildWrapper =
  (
    store: ReturnType<typeof createStore>,
    surface: 'main' | 'side-panel' = 'side-panel',
  ) =>
  ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>
      <WorkspaceSurfaceContext.Provider
        value={{
          type: surface,
          instanceId:
            surface === 'side-panel'
              ? SIDE_PANEL_INSTANCE_ID
              : MAIN_CONTEXT_STORE_INSTANCE_ID,
          ownsRouteLocation: false,
        }}
      >
        {children}
      </WorkspaceSurfaceContext.Provider>
    </JotaiProvider>
  );

describe('useSelectableList surface scoping', () => {
  it('is read back by a reader passing the same raw id on that surface', () => {
    const store = createStore();
    const wrapper = buildWrapper(store);

    const { result: list } = renderHook(() => useSelectableList(DROPDOWN_ID), {
      wrapper,
    });

    act(() => {
      list.current.setSelectedItemId('option-b');
    });

    const { result: read } = renderHook(
      () =>
        useAtomComponentStateValue(selectedItemIdComponentState, DROPDOWN_ID),
      { wrapper },
    );

    expect(read.current).toBe('option-b');
  });

  it('stays invisible to the same raw id on another surface', () => {
    const store = createStore();

    const { result: list } = renderHook(() => useSelectableList(DROPDOWN_ID), {
      wrapper: buildWrapper(store),
    });

    act(() => {
      list.current.setSelectedItemId('option-b');
    });

    const { result: mainRead } = renderHook(
      () =>
        useAtomComponentStateValue(selectedItemIdComponentState, DROPDOWN_ID),
      { wrapper: buildWrapper(store, 'main') },
    );

    expect(mainRead.current).toBeNull();
  });
});

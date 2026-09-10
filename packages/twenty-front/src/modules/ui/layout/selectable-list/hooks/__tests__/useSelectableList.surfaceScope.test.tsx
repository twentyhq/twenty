import { act, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { WorkspaceSurfaceContext } from '@/ui/layout/contexts/WorkspaceSurfaceContext';
import { useWorkspaceSurfaceScopedComponentInstanceId } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

const DROPDOWN_ID = 'sort-dropdown';
const SIDE_PANEL_INSTANCE_ID = 'side-panel-page';

const buildWrapper =
  (store: ReturnType<typeof createStore>) =>
  ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>
      <WorkspaceSurfaceContext.Provider
        value={{
          type: 'side-panel',
          instanceId: SIDE_PANEL_INSTANCE_ID,
          ownsRouteLocation: false,
        }}
      >
        {children}
      </WorkspaceSurfaceContext.Provider>
    </JotaiProvider>
  );

// useSelectableList scopes the id it is handed to the current surface before
// writing. A component that reads selectedItemIdComponentState directly with
// the raw id it passed in would look at a different atom inside a side panel,
// so such readers scope the id the same way first.
describe('useSelectableList surface scoping', () => {
  it('writes under the surface-scoped id, which a scoped reader sees and a raw reader does not', () => {
    const store = createStore();
    const wrapper = buildWrapper(store);

    const { result: list } = renderHook(() => useSelectableList(DROPDOWN_ID), {
      wrapper,
    });

    act(() => {
      list.current.setSelectedItemId('option-b');
    });

    const { result: scopedRead } = renderHook(
      () => {
        const scopedDropdownId =
          useWorkspaceSurfaceScopedComponentInstanceId(DROPDOWN_ID);

        return useAtomComponentStateValue(
          selectedItemIdComponentState,
          scopedDropdownId,
        );
      },
      { wrapper },
    );

    const { result: rawRead } = renderHook(
      () =>
        useAtomComponentStateValue(selectedItemIdComponentState, DROPDOWN_ID),
      { wrapper },
    );

    expect(scopedRead.current).toBe('option-b');
    expect(rawRead.current).toBeNull();
  });
});

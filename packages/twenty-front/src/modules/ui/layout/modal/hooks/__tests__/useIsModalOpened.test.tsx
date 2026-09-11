import { act, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { WorkspaceSurfaceContext } from '@/ui/layout/contexts/WorkspaceSurfaceContext';
import { useIsModalOpened } from '@/ui/layout/modal/hooks/useIsModalOpened';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

const MODAL_ID = 'remove-sorting-modal';

const buildWrapper =
  (store: ReturnType<typeof createStore>) =>
  ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>
      <WorkspaceSurfaceContext.Provider
        value={{
          type: 'side-panel',
          instanceId: 'side-panel-page',
          ownsRouteLocation: true,
        }}
      >
        {children}
      </WorkspaceSurfaceContext.Provider>
    </JotaiProvider>
  );

// Same contract as useIsDropdownOpen: useModal writes under a surface-scoped
// id, so a reader holding the raw modal id has to resolve it the same way.
describe('useIsModalOpened', () => {
  it('sees a modal opened by its raw id inside a side panel', () => {
    const store = createStore();
    const wrapper = buildWrapper(store);

    const { result: modal } = renderHook(() => useModal(), { wrapper });

    act(() => {
      modal.current.openModal(MODAL_ID);
    });

    const { result: isModalOpened } = renderHook(
      () => useIsModalOpened(MODAL_ID),
      { wrapper },
    );

    const { result: rawRead } = renderHook(
      () => useAtomComponentStateValue(isModalOpenedComponentState, MODAL_ID),
      { wrapper },
    );

    expect(isModalOpened.current).toBe(true);
    expect(rawRead.current).toBe(false);
  });
});

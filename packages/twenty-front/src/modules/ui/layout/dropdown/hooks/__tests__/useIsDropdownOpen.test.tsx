import { act, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { WorkspaceSurfaceContext } from '@/ui/layout/contexts/WorkspaceSurfaceContext';
import { useIsDropdownOpen } from '@/ui/layout/dropdown/hooks/useIsDropdownOpen';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

const DROPDOWN_ID = 'country-select-dropdown';

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

// The dropdown hooks store the open state under a surface-scoped id. A reader
// holding the raw id it passed to <Dropdown> must resolve it the same way,
// which is what useIsDropdownOpen does and a direct atom read does not.
describe('useIsDropdownOpen', () => {
  it('sees a dropdown opened by its raw id inside a side panel', () => {
    const store = createStore();
    const wrapper = buildWrapper(store);

    const { result: open } = renderHook(() => useOpenDropdown(), { wrapper });

    act(() => {
      open.current.openDropdown({
        dropdownComponentInstanceIdFromProps: DROPDOWN_ID,
      });
    });

    const { result: isDropdownOpen } = renderHook(
      () => useIsDropdownOpen(DROPDOWN_ID),
      { wrapper },
    );

    const { result: rawRead } = renderHook(
      () =>
        useAtomComponentStateValue(isDropdownOpenComponentState, DROPDOWN_ID),
      { wrapper },
    );

    expect(isDropdownOpen.current).toBe(true);
    expect(rawRead.current).toBe(false);
  });
});

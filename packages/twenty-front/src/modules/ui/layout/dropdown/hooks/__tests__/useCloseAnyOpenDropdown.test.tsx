import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { act } from 'react';

import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useCloseAnyOpenDropdown } from '@/ui/layout/dropdown/hooks/useCloseAnyOpenDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { activeDropdownFocusIdState } from '@/ui/layout/dropdown/states/activeDropdownFocusIdState';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { previousDropdownFocusIdStackState } from '@/ui/layout/dropdown/states/previousDropdownFocusIdStackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

const dropdownId = 'test-dropdown-id';
const dropdownIdA = 'test-dropdown-id-a';
const dropdownIdB = 'test-dropdown-id-b';
const dropdownIdC = 'test-dropdown-id-c';

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <JotaiProvider store={jotaiStore}>
      <DropdownComponentInstanceContext.Provider
        value={{ instanceId: dropdownId }}
      >
        {children}
      </DropdownComponentInstanceContext.Provider>
    </JotaiProvider>
  );
};

describe('useCloseAnyOpenDropdown', () => {
  beforeEach(() => {
    jotaiStore.set(
      isDropdownOpenComponentState.atomFamily({ instanceId: dropdownId }),
      false,
    );
    jotaiStore.set(activeDropdownFocusIdState.atom, null);
    jotaiStore.set(previousDropdownFocusIdStackState.atom, []);
  });

  it('should open dropdown and then close it with closeAnyOpenDropdown', async () => {
    const { result } = renderHook(
      () => {
        const isDropdownOpen = useAtomComponentStateValue(
          isDropdownOpenComponentState,
          dropdownId,
        );

        const { openDropdown } = useOpenDropdown();

        const { closeAnyOpenDropdown } = useCloseAnyOpenDropdown();

        return { closeAnyOpenDropdown, isDropdownOpen, openDropdown };
      },
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current.isDropdownOpen).toBe(false);

    act(() => {
      result.current.openDropdown();
    });

    expect(result.current.isDropdownOpen).toBe(true);

    act(() => {
      result.current.closeAnyOpenDropdown();
    });

    expect(result.current.isDropdownOpen).toBe(false);
  });

  it('should close all nested dropdowns when multiple are open', () => {
    jotaiStore.set(
      isDropdownOpenComponentState.atomFamily({ instanceId: dropdownIdA }),
      true,
    );
    jotaiStore.set(
      isDropdownOpenComponentState.atomFamily({ instanceId: dropdownIdB }),
      true,
    );
    jotaiStore.set(
      isDropdownOpenComponentState.atomFamily({ instanceId: dropdownIdC }),
      true,
    );
    jotaiStore.set(activeDropdownFocusIdState.atom, dropdownIdC);
    jotaiStore.set(previousDropdownFocusIdStackState.atom, [
      dropdownIdA,
      dropdownIdB,
    ]);

    const { result } = renderHook(() => useCloseAnyOpenDropdown(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.closeAnyOpenDropdown();
    });

    expect(
      jotaiStore.get(
        isDropdownOpenComponentState.atomFamily({ instanceId: dropdownIdA }),
      ),
    ).toBe(false);
    expect(
      jotaiStore.get(
        isDropdownOpenComponentState.atomFamily({ instanceId: dropdownIdB }),
      ),
    ).toBe(false);
    expect(
      jotaiStore.get(
        isDropdownOpenComponentState.atomFamily({ instanceId: dropdownIdC }),
      ),
    ).toBe(false);
    expect(jotaiStore.get(activeDropdownFocusIdState.atom)).toBeNull();
    expect(jotaiStore.get(previousDropdownFocusIdStackState.atom)).toEqual([]);
  });

  it('should do nothing when no dropdowns are open', () => {
    const { result } = renderHook(() => useCloseAnyOpenDropdown(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.closeAnyOpenDropdown();
    });

    expect(jotaiStore.get(activeDropdownFocusIdState.atom)).toBeNull();
    expect(jotaiStore.get(previousDropdownFocusIdStackState.atom)).toEqual([]);
  });
});

import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { act } from 'react';

import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { activeDropdownFocusIdState } from '@/ui/layout/dropdown/states/activeDropdownFocusIdState';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { previousDropdownFocusIdStackState } from '@/ui/layout/dropdown/states/previousDropdownFocusIdStackState';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

const dropdownId = 'test-dropdown-id';
const outsideDropdownId = 'test-dropdown-id-outside';

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <JotaiProvider store={jotaiStore}>
      <DropdownComponentInstanceContext.Provider
        value={{ instanceId: dropdownId }}
      >
        {children}
      </DropdownComponentInstanceContext.Provider>
      <DropdownComponentInstanceContext.Provider
        value={{ instanceId: outsideDropdownId }}
      ></DropdownComponentInstanceContext.Provider>
    </JotaiProvider>
  );
};

describe('useCloseDropdown', () => {
  beforeEach(() => {
    jotaiStore.set(activeDropdownFocusIdState.atom, null);
    jotaiStore.set(previousDropdownFocusIdStackState.atom, []);
    jotaiStore.set(focusStackState.atom, []);
    jotaiStore.set(
      isDropdownOpenComponentState.atomFamily({ instanceId: dropdownId }),
      false,
    );
    jotaiStore.set(
      isDropdownOpenComponentState.atomFamily({
        instanceId: outsideDropdownId,
      }),
      false,
    );
  });

  it('should close dropdown from inside component instance context', async () => {
    const { result } = renderHook(
      () => {
        // oxlint-disable-next-line twenty/matching-state-variable
        const isOutsideDropdownOpen = useAtomComponentStateValue(
          isDropdownOpenComponentState,
          outsideDropdownId,
        );

        const isDropdownOpen = useAtomComponentStateValue(
          isDropdownOpenComponentState,
        );

        const { closeDropdown } = useCloseDropdown();
        const { openDropdown } = useOpenDropdown();

        return {
          isOutsideDropdownOpen,
          isDropdownOpen,
          closeDropdown,
          openDropdown,
        };
      },
      {
        wrapper: Wrapper,
      },
    );

    act(() => {
      result.current.openDropdown();
    });

    expect(result.current.isDropdownOpen).toBe(true);
    expect(result.current.isOutsideDropdownOpen).toBe(false);

    act(() => {
      result.current.closeDropdown();
    });

    expect(result.current.isDropdownOpen).toBe(false);
    expect(result.current.isOutsideDropdownOpen).toBe(false);
  });

  it('should close dropdown from outside component instance context', async () => {
    const { result } = renderHook(
      () => {
        // oxlint-disable-next-line twenty/matching-state-variable
        const isOutsideDropdownOpen = useAtomComponentStateValue(
          isDropdownOpenComponentState,
          outsideDropdownId,
        );

        const isDropdownOpen = useAtomComponentStateValue(
          isDropdownOpenComponentState,
        );

        const { closeDropdown } = useCloseDropdown();
        const { openDropdown } = useOpenDropdown();

        return {
          isOutsideDropdownOpen,
          isDropdownOpen,
          closeDropdown,
          openDropdown,
        };
      },
      {
        wrapper: Wrapper,
      },
    );

    act(() => {
      result.current.openDropdown({
        dropdownComponentInstanceIdFromProps: outsideDropdownId,
      });
    });

    expect(result.current.isDropdownOpen).toBe(false);
    expect(result.current.isOutsideDropdownOpen).toBe(true);

    act(() => {
      result.current.closeDropdown(outsideDropdownId);
    });

    expect(result.current.isDropdownOpen).toBe(false);
    expect(result.current.isOutsideDropdownOpen).toBe(false);
  });

  it('keeps the active dropdown focused when an earlier dropdown closes', () => {
    const { result } = renderHook(
      () => ({ ...useOpenDropdown(), ...useCloseDropdown() }),
      { wrapper: Wrapper },
    );

    act(() => {
      result.current.openDropdown();
      result.current.openDropdown({
        dropdownComponentInstanceIdFromProps: outsideDropdownId,
      });
    });

    expect(jotaiStore.get(activeDropdownFocusIdState.atom)).toBe(
      outsideDropdownId,
    );
    expect(jotaiStore.get(previousDropdownFocusIdStackState.atom)).toEqual([
      dropdownId,
    ]);

    act(() => {
      result.current.closeDropdown();
    });

    expect(
      jotaiStore.get(
        isDropdownOpenComponentState.atomFamily({ instanceId: dropdownId }),
      ),
    ).toBe(false);
    expect(
      jotaiStore.get(
        isDropdownOpenComponentState.atomFamily({
          instanceId: outsideDropdownId,
        }),
      ),
    ).toBe(true);
    expect(jotaiStore.get(activeDropdownFocusIdState.atom)).toBe(
      outsideDropdownId,
    );
    expect(jotaiStore.get(previousDropdownFocusIdStackState.atom)).toEqual([]);
    expect(
      jotaiStore.get(focusStackState.atom).map(({ focusId }) => focusId),
    ).toEqual([outsideDropdownId]);

    act(() => {
      result.current.closeDropdown(outsideDropdownId);
    });

    expect(jotaiStore.get(activeDropdownFocusIdState.atom)).toBeNull();
    expect(jotaiStore.get(previousDropdownFocusIdStackState.atom)).toEqual([]);
    expect(jotaiStore.get(focusStackState.atom)).toEqual([]);
  });
});

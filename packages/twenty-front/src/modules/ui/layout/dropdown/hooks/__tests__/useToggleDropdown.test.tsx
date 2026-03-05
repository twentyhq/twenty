import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { act } from 'react';

import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useToggleDropdown } from '@/ui/layout/dropdown/hooks/useToggleDropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
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

describe('useToggleDropdown', () => {
  beforeEach(() => {
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

  it('should toggle dropdown from inside component instance context', async () => {
    const { result } = renderHook(
      () => {
        // eslint-disable-next-line twenty/matching-state-variable
        const isOutsideDropdownOpen = useAtomComponentStateValue(
          isDropdownOpenComponentState,
          outsideDropdownId,
        );

        const isDropdownOpen = useAtomComponentStateValue(
          isDropdownOpenComponentState,
        );
        const { toggleDropdown } = useToggleDropdown();

        return { isOutsideDropdownOpen, isDropdownOpen, toggleDropdown };
      },
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current.isDropdownOpen).toBe(false);
    expect(result.current.isOutsideDropdownOpen).toBe(false);

    act(() => {
      result.current.toggleDropdown();
    });

    expect(result.current.isDropdownOpen).toBe(true);
    expect(result.current.isOutsideDropdownOpen).toBe(false);

    act(() => {
      result.current.toggleDropdown();
    });

    expect(result.current.isDropdownOpen).toBe(false);
    expect(result.current.isOutsideDropdownOpen).toBe(false);

    act(() => {
      result.current.toggleDropdown();
    });

    expect(result.current.isDropdownOpen).toBe(true);
    expect(result.current.isOutsideDropdownOpen).toBe(false);
  });

  it('should toggle dropdown from outside component instance context', async () => {
    const { result } = renderHook(
      () => {
        // eslint-disable-next-line twenty/matching-state-variable
        const isOutsideDropdownOpen = useAtomComponentStateValue(
          isDropdownOpenComponentState,
          outsideDropdownId,
        );

        const isDropdownOpen = useAtomComponentStateValue(
          isDropdownOpenComponentState,
        );
        const { toggleDropdown } = useToggleDropdown();

        return { isOutsideDropdownOpen, isDropdownOpen, toggleDropdown };
      },
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current.isDropdownOpen).toBe(false);
    expect(result.current.isOutsideDropdownOpen).toBe(false);

    act(() => {
      result.current.toggleDropdown({
        dropdownComponentInstanceIdFromProps: outsideDropdownId,
      });
    });

    expect(result.current.isDropdownOpen).toBe(false);
    expect(result.current.isOutsideDropdownOpen).toBe(true);

    act(() => {
      result.current.toggleDropdown({
        dropdownComponentInstanceIdFromProps: outsideDropdownId,
      });
    });

    expect(result.current.isDropdownOpen).toBe(false);
    expect(result.current.isOutsideDropdownOpen).toBe(false);

    act(() => {
      result.current.toggleDropdown({
        dropdownComponentInstanceIdFromProps: outsideDropdownId,
      });
    });

    expect(result.current.isDropdownOpen).toBe(false);
    expect(result.current.isOutsideDropdownOpen).toBe(true);
  });
});

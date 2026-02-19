import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { act } from 'react';
import { RecoilRoot } from 'recoil';

import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

const dropdownId = 'test-dropdown-id';
const outsideDropdownId = 'test-dropdown-id-outside';

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <JotaiProvider store={jotaiStore}>
      <RecoilRoot>
        <DropdownComponentInstanceContext.Provider
          value={{ instanceId: dropdownId }}
        >
          {children}
        </DropdownComponentInstanceContext.Provider>
        <DropdownComponentInstanceContext.Provider
          value={{ instanceId: outsideDropdownId }}
        ></DropdownComponentInstanceContext.Provider>
      </RecoilRoot>
    </JotaiProvider>
  );
};

describe('useCloseDropdown', () => {
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

  it('should close dropdown from inside component instance context', async () => {
    const { result } = renderHook(
      () => {
        const isOutsideDropdownOpen = useRecoilComponentValueV2(
          isDropdownOpenComponentState,
          outsideDropdownId,
        );

        const isInsideDropdownOpen = useRecoilComponentValueV2(
          isDropdownOpenComponentState,
        );

        const { closeDropdown } = useCloseDropdown();
        const { openDropdown } = useOpenDropdown();

        return {
          isOutsideDropdownOpen,
          isInsideDropdownOpen,
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

    expect(result.current.isInsideDropdownOpen).toBe(true);
    expect(result.current.isOutsideDropdownOpen).toBe(false);

    act(() => {
      result.current.closeDropdown();
    });

    expect(result.current.isInsideDropdownOpen).toBe(false);
    expect(result.current.isOutsideDropdownOpen).toBe(false);
  });

  it('should close dropdown from outside component instance context', async () => {
    const { result } = renderHook(
      () => {
        const isOutsideDropdownOpen = useRecoilComponentValueV2(
          isDropdownOpenComponentState,
          outsideDropdownId,
        );

        const isInsideDropdownOpen = useRecoilComponentValueV2(
          isDropdownOpenComponentState,
        );

        const { closeDropdown } = useCloseDropdown();
        const { openDropdown } = useOpenDropdown();

        return {
          isOutsideDropdownOpen,
          isInsideDropdownOpen,
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

    expect(result.current.isInsideDropdownOpen).toBe(false);
    expect(result.current.isOutsideDropdownOpen).toBe(true);

    act(() => {
      result.current.closeDropdown(outsideDropdownId);
    });

    expect(result.current.isInsideDropdownOpen).toBe(false);
    expect(result.current.isOutsideDropdownOpen).toBe(false);
  });
});

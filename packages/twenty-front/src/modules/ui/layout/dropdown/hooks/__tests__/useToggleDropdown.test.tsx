import { expect } from '@storybook/test';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { RecoilRoot } from 'recoil';

import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useToggleDropdown } from '@/ui/layout/dropdown/hooks/useToggleDropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

const dropdownId = 'test-dropdown-id';
const outsideDropdownId = 'test-dropdown-id-outside';

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
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
  );
};

describe('useToggleDropdown', () => {
  it('should toggle dropdown from inside component instance context', async () => {
    const { result } = renderHook(
      () => {
        const isOutsideDropdownOpen = useRecoilComponentValue(
          isDropdownOpenComponentState,
          outsideDropdownId,
        );

        const isInsideDropdownOpen = useRecoilComponentValue(
          isDropdownOpenComponentState,
        );
        const { toggleDropdown } = useToggleDropdown();

        return { isOutsideDropdownOpen, isInsideDropdownOpen, toggleDropdown };
      },
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current.isInsideDropdownOpen).toBe(false);
    expect(result.current.isOutsideDropdownOpen).toBe(false);

    act(() => {
      result.current.toggleDropdown();
    });

    expect(result.current.isInsideDropdownOpen).toBe(true);
    expect(result.current.isOutsideDropdownOpen).toBe(false);

    act(() => {
      result.current.toggleDropdown();
    });

    expect(result.current.isInsideDropdownOpen).toBe(false);
    expect(result.current.isOutsideDropdownOpen).toBe(false);

    act(() => {
      result.current.toggleDropdown();
    });

    expect(result.current.isInsideDropdownOpen).toBe(true);
    expect(result.current.isOutsideDropdownOpen).toBe(false);
  });

  it('should toggle dropdown from outside component instance context', async () => {
    const { result } = renderHook(
      () => {
        const isOutsideDropdownOpen = useRecoilComponentValue(
          isDropdownOpenComponentState,
          outsideDropdownId,
        );

        const isInsideDropdownOpen = useRecoilComponentValue(
          isDropdownOpenComponentState,
        );
        const { toggleDropdown } = useToggleDropdown();

        return { isOutsideDropdownOpen, isInsideDropdownOpen, toggleDropdown };
      },
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current.isInsideDropdownOpen).toBe(false);
    expect(result.current.isOutsideDropdownOpen).toBe(false);

    act(() => {
      result.current.toggleDropdown({
        dropdownComponentInstanceIdFromProps: outsideDropdownId,
      });
    });

    expect(result.current.isInsideDropdownOpen).toBe(false);
    expect(result.current.isOutsideDropdownOpen).toBe(true);

    act(() => {
      result.current.toggleDropdown({
        dropdownComponentInstanceIdFromProps: outsideDropdownId,
      });
    });

    expect(result.current.isInsideDropdownOpen).toBe(false);
    expect(result.current.isOutsideDropdownOpen).toBe(false);

    act(() => {
      result.current.toggleDropdown({
        dropdownComponentInstanceIdFromProps: outsideDropdownId,
      });
    });

    expect(result.current.isInsideDropdownOpen).toBe(false);
    expect(result.current.isOutsideDropdownOpen).toBe(true);
  });
});

import { expect } from '@storybook/test';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { RecoilRoot } from 'recoil';

import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
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

describe('useOpenDropdown', () => {
  it('should open dropdown from inside component instance context', async () => {
    const { result } = renderHook(
      () => {
        const isOutsideDropdownOpen = useRecoilComponentValue(
          isDropdownOpenComponentState,
          outsideDropdownId,
        );

        const isInsideDropdownOpen = useRecoilComponentValue(
          isDropdownOpenComponentState,
        );

        const { openDropdown } = useOpenDropdown();

        return { isOutsideDropdownOpen, isInsideDropdownOpen, openDropdown };
      },
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current.isInsideDropdownOpen).toBe(false);
    expect(result.current.isOutsideDropdownOpen).toBe(false);

    act(() => {
      result.current.openDropdown();
    });

    expect(result.current.isInsideDropdownOpen).toBe(true);
    expect(result.current.isOutsideDropdownOpen).toBe(false);
  });

  it('should open dropdown from outside component instance context', async () => {
    const { result } = renderHook(
      () => {
        const isOutsideDropdownOpen = useRecoilComponentValue(
          isDropdownOpenComponentState,
          outsideDropdownId,
        );

        const isInsideDropdownOpen = useRecoilComponentValue(
          isDropdownOpenComponentState,
        );

        const { openDropdown } = useOpenDropdown();

        return { isInsideDropdownOpen, isOutsideDropdownOpen, openDropdown };
      },
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current.isInsideDropdownOpen).toBe(false);
    expect(result.current.isOutsideDropdownOpen).toBe(false);

    act(() => {
      result.current.openDropdown({
        dropdownComponentInstanceIdFromProps: outsideDropdownId,
      });
    });

    expect(result.current.isInsideDropdownOpen).toBe(false);
    expect(result.current.isOutsideDropdownOpen).toBe(true);
  });
});

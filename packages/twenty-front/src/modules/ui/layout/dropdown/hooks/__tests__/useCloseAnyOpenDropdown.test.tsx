import { expect } from '@storybook/test';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { RecoilRoot } from 'recoil';

import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useCloseAnyOpenDropdown } from '@/ui/layout/dropdown/hooks/useCloseAnyOpenDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

const dropdownId = 'test-dropdown-id';

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <RecoilRoot>
      <DropdownComponentInstanceContext.Provider
        value={{ instanceId: dropdownId }}
      >
        {children}
      </DropdownComponentInstanceContext.Provider>
    </RecoilRoot>
  );
};

describe('useCloseAnyOpenDropdown', () => {
  it('should open dropdown and then close it with closeAnyOpenDropdown', async () => {
    const { result } = renderHook(
      () => {
        const isDropdownOpen = useRecoilComponentValue(
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
});

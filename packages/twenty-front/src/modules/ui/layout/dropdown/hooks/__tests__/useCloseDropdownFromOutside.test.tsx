import { expect } from '@storybook/test';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { RecoilRoot } from 'recoil';

import { useCloseDropdownFromOutside } from '@/ui/layout/dropdown/hooks/useCloseDropdownFromOutside';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';

const dropdownId = 'test-dropdown-id';

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return <RecoilRoot>{children}</RecoilRoot>;
};

describe('useCloseDropdownFromOutside', () => {
  it('should close open dropdown', async () => {
    const { result } = renderHook(
      () => {
        const { isDropdownOpen, openDropdown } = useDropdown(dropdownId);
        const { closeDropdownFromOutside } = useCloseDropdownFromOutside();

        return { closeDropdownFromOutside, isDropdownOpen, openDropdown };
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
      result.current.closeDropdownFromOutside(dropdownId);
    });

    expect(result.current.isDropdownOpen).toBe(false);
  });
});

import { expect } from '@storybook/test';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { RecoilRoot } from 'recoil';

import { useCloseAnyOpenDropdown } from '@/ui/layout/dropdown/hooks/useCloseAnyOpenDropdown';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';

const dropdownId = 'test-dropdown-id';

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return <RecoilRoot>{children}</RecoilRoot>;
};

describe('useCloseAnyOpenDropdown', () => {
  it('should open dropdown and then close it with closeAnyOpenDropdown', async () => {
    const { result } = renderHook(
      () => {
        const { openDropdown, isDropdownOpen } = useDropdown(dropdownId);

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

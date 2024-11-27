import { expect } from '@storybook/test';
import { renderHook } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { RecoilRoot } from 'recoil';

import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';

const dropdownId = 'test-dropdown-id';

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return <RecoilRoot>{children}</RecoilRoot>;
};

describe('useDropdown', () => {
  it('should toggleDropdown', async () => {
    const { result } = renderHook(() => useDropdown(dropdownId), {
      wrapper: Wrapper,
    });

    expect(result.current.isDropdownOpen).toBe(false);

    act(() => {
      result.current.toggleDropdown();
    });

    expect(result.current.isDropdownOpen).toBe(true);

    act(() => {
      result.current.toggleDropdown();
    });

    expect(result.current.isDropdownOpen).toBe(false);
  });

  it('should open and close dropdown', async () => {
    const { result } = renderHook(() => useDropdown(dropdownId), {
      wrapper: Wrapper,
    });

    expect(result.current.isDropdownOpen).toBe(false);

    act(() => {
      result.current.openDropdown();
    });

    expect(result.current.isDropdownOpen).toBe(true);

    act(() => {
      result.current.closeDropdown();
    });

    expect(result.current.isDropdownOpen).toBe(false);
  });

  it('should change dropdownWidth', async () => {
    const { result } = renderHook(() => useDropdown(dropdownId), {
      wrapper: Wrapper,
    });

    expect(result.current.dropdownWidth).toBe(200);

    await act(async () => {
      result.current.setDropdownWidth(220);
    });

    expect(result.current.dropdownWidth).toEqual(220);
  });
});

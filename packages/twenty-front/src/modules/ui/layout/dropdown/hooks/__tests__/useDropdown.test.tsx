import { act } from 'react-dom/test-utils';
import { expect } from '@storybook/test';
import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';

const dropdownScopeId = 'testId';

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <RecoilRoot>
      <DropdownScope dropdownScopeId={dropdownScopeId}>
        {children}
      </DropdownScope>
    </RecoilRoot>
  );
};

describe('useDropdown', () => {
  it('should toggleDropdown', async () => {
    const { result } = renderHook(() => useDropdown(dropdownScopeId), {
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
    const { result } = renderHook(() => useDropdown(dropdownScopeId), {
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
    const { result } = renderHook(() => useDropdown(dropdownScopeId), {
      wrapper: Wrapper,
    });

    expect(result.current.dropdownWidth).toBe(160);

    await act(async () => {
      result.current.setDropdownWidth(220);
    });

    expect(result.current.dropdownWidth).toEqual(220);
  });

  it('should change dropdownHotkeyScope', async () => {
    const { result } = renderHook(() => useDropdown(dropdownScopeId), {
      wrapper: Wrapper,
    });

    expect(result.current.dropdownHotkeyScope).toBeNull();

    await act(async () => {
      result.current.setDropdownHotkeyScope({ scope: 'test-scope' });
    });

    expect(result.current.dropdownHotkeyScope).toEqual({ scope: 'test-scope' });
  });
});

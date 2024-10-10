import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { useActionMenu } from '../useActionMenu';

const openBottomBar = jest.fn();
const closeBottomBar = jest.fn();
const openDropdown = jest.fn();
const closeDropdown = jest.fn();

jest.mock('@/ui/layout/bottom-bar/hooks/useBottomBar', () => ({
  useBottomBar: jest.fn(() => ({
    openBottomBar: openBottomBar,
    closeBottomBar: closeBottomBar,
  })),
}));

jest.mock('@/ui/layout/dropdown/hooks/useDropdownV2', () => ({
  useDropdownV2: jest.fn(() => ({
    openDropdown: openDropdown,
    closeDropdown: closeDropdown,
  })),
}));

describe('useActionMenu', () => {
  const actionMenuId = 'test-action-menu';

  it('should return the correct functions', () => {
    const { result } = renderHook(() => useActionMenu(actionMenuId));

    expect(result.current).toHaveProperty('openActionMenuDropdown');
    expect(result.current).toHaveProperty('openActionBar');
    expect(result.current).toHaveProperty('closeActionBar');
    expect(result.current).toHaveProperty('closeActionMenuDropdown');
  });

  it('should call the correct functions when opening action menu dropdown', () => {
    const { result } = renderHook(() => useActionMenu(actionMenuId));

    act(() => {
      result.current.openActionMenuDropdown();
    });

    expect(closeBottomBar).toHaveBeenCalledWith(`action-bar-${actionMenuId}`);
    expect(openDropdown).toHaveBeenCalledWith(
      `action-menu-dropdown-${actionMenuId}`,
    );
  });

  it('should call the correct functions when opening action bar', () => {
    const { result } = renderHook(() => useActionMenu(actionMenuId));

    act(() => {
      result.current.openActionBar();
    });

    expect(closeDropdown).toHaveBeenCalledWith(
      `action-menu-dropdown-${actionMenuId}`,
    );
    expect(openBottomBar).toHaveBeenCalledWith(`action-bar-${actionMenuId}`);
  });

  it('should call the correct function when closing action menu dropdown', () => {
    const { result } = renderHook(() => useActionMenu(actionMenuId));

    act(() => {
      result.current.closeActionMenuDropdown();
    });

    expect(closeDropdown).toHaveBeenCalledWith(
      `action-menu-dropdown-${actionMenuId}`,
    );
  });

  it('should call the correct function when closing action bar', () => {
    const { result } = renderHook(() => useActionMenu(actionMenuId));

    act(() => {
      result.current.closeActionBar();
    });

    expect(closeBottomBar).toHaveBeenCalledWith(`action-bar-${actionMenuId}`);
  });
});

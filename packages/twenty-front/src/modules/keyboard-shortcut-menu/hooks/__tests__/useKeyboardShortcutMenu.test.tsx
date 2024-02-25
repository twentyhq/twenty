import { expect } from '@storybook/test';
import { act, renderHook } from '@testing-library/react';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { isKeyboardShortcutMenuOpenedState } from '@/keyboard-shortcut-menu/states/isKeyboardShortcutMenuOpenedState';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';

import { useKeyboardShortcutMenu } from '../useKeyboardShortcutMenu';

const mockSetHotkeyScopeAndMemorizePreviousScope = jest.fn();

const mockGoBackToPreviousHotkeyScope = jest.fn();

jest.mock('@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope', () => ({
  usePreviousHotkeyScope: () => ({
    setHotkeyScopeAndMemorizePreviousScope:
      mockSetHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope: mockGoBackToPreviousHotkeyScope,
  }),
}));

const renderHookConfig = () => {
  const { result } = renderHook(
    () => {
      const isKeyboardShortcutMenuOpened = useRecoilValue(
        isKeyboardShortcutMenuOpenedState,
      );
      return {
        ...useKeyboardShortcutMenu(),
        isKeyboardShortcutMenuOpened,
      };
    },
    {
      wrapper: RecoilRoot,
    },
  );
  return { result };
};

describe('useKeyboardShortcutMenu', () => {
  it('should toggle keyboard shortcut menu correctly', async () => {
    const { result } = renderHookConfig();
    expect(result.current.toggleKeyboardShortcutMenu).toBeDefined();
    expect(result.current.isKeyboardShortcutMenuOpened).toBe(false);

    act(() => {
      result.current.toggleKeyboardShortcutMenu();
    });

    expect(mockSetHotkeyScopeAndMemorizePreviousScope).toHaveBeenCalledWith(
      AppHotkeyScope.KeyboardShortcutMenu,
    );
    expect(result.current.isKeyboardShortcutMenuOpened).toBe(true);

    act(() => {
      result.current.toggleKeyboardShortcutMenu();
    });

    expect(mockSetHotkeyScopeAndMemorizePreviousScope).toHaveBeenCalledWith(
      AppHotkeyScope.KeyboardShortcutMenu,
    );
    expect(result.current.isKeyboardShortcutMenuOpened).toBe(false);
  });

  it('should open and close keyboard shortcut menu correctly', async () => {
    const { result } = renderHookConfig();
    act(() => {
      result.current.openKeyboardShortcutMenu();
    });

    expect(mockSetHotkeyScopeAndMemorizePreviousScope).toHaveBeenCalledWith(
      AppHotkeyScope.KeyboardShortcutMenu,
    );
    expect(result.current.isKeyboardShortcutMenuOpened).toBe(true);

    act(() => {
      result.current.closeKeyboardShortcutMenu();
    });

    expect(mockGoBackToPreviousHotkeyScope).toHaveBeenCalled();
    expect(result.current.isKeyboardShortcutMenuOpened).toBe(false);
  });
});

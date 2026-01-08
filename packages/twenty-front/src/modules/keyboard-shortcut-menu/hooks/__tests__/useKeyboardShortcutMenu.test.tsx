import { expect } from '@storybook/test';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { isKeyboardShortcutMenuOpenedState } from '@/keyboard-shortcut-menu/states/isKeyboardShortcutMenuOpenedState';

import { useKeyboardShortcutMenu } from '@/keyboard-shortcut-menu/hooks/useKeyboardShortcutMenu';

const mockPushFocusItemToFocusStack = jest.fn();
const mockRemoveFocusItemFromFocusStackById = jest.fn();

jest.mock('@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack', () => ({
  usePushFocusItemToFocusStack: () => ({
    pushFocusItemToFocusStack: mockPushFocusItemToFocusStack,
  }),
}));

jest.mock(
  '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById',
  () => ({
    useRemoveFocusItemFromFocusStackById: () => ({
      removeFocusItemFromFocusStackById: mockRemoveFocusItemFromFocusStackById,
    }),
  }),
);

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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should toggle keyboard shortcut menu correctly', async () => {
    const { result } = renderHookConfig();
    expect(result.current.toggleKeyboardShortcutMenu).toBeDefined();
    expect(result.current.isKeyboardShortcutMenuOpened).toBe(false);

    act(() => {
      result.current.toggleKeyboardShortcutMenu();
    });

    expect(mockPushFocusItemToFocusStack).toHaveBeenCalledWith({
      focusId: 'keyboard-shortcut-menu',
      component: {
        type: 'keyboard-shortcut-menu',
        instanceId: 'keyboard-shortcut-menu',
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysConflictingWithKeyboard: false,
        enableGlobalHotkeysWithModifiers: false,
      },
    });
    expect(result.current.isKeyboardShortcutMenuOpened).toBe(true);

    act(() => {
      result.current.toggleKeyboardShortcutMenu();
    });

    expect(mockRemoveFocusItemFromFocusStackById).toHaveBeenCalledWith({
      focusId: 'keyboard-shortcut-menu',
    });
    expect(result.current.isKeyboardShortcutMenuOpened).toBe(false);
  });

  it('should open and close keyboard shortcut menu correctly', async () => {
    const { result } = renderHookConfig();
    act(() => {
      result.current.openKeyboardShortcutMenu();
    });

    expect(mockPushFocusItemToFocusStack).toHaveBeenCalledWith({
      focusId: 'keyboard-shortcut-menu',
      component: {
        type: 'keyboard-shortcut-menu',
        instanceId: 'keyboard-shortcut-menu',
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysConflictingWithKeyboard: false,
        enableGlobalHotkeysWithModifiers: false,
      },
    });
    expect(result.current.isKeyboardShortcutMenuOpened).toBe(true);

    act(() => {
      result.current.closeKeyboardShortcutMenu();
    });

    expect(mockRemoveFocusItemFromFocusStackById).toHaveBeenCalledWith({
      focusId: 'keyboard-shortcut-menu',
    });
    expect(result.current.isKeyboardShortcutMenuOpened).toBe(false);
  });
});

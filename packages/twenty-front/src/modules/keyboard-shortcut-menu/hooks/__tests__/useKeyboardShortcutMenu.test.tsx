import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode, act } from 'react';

import { isKeyboardShortcutMenuOpenedState } from '@/keyboard-shortcut-menu/states/isKeyboardShortcutMenuOpenedState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

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

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

const renderHookConfig = () => {
  const { result } = renderHook(
    () => {
      const isKeyboardShortcutMenuOpened = useAtomStateValue(
        isKeyboardShortcutMenuOpenedState,
      );
      return {
        ...useKeyboardShortcutMenu(),
        isKeyboardShortcutMenuOpened,
      };
    },
    {
      wrapper: Wrapper,
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

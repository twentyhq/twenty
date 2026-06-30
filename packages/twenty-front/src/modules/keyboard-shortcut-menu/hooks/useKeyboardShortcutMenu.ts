import { useCallback } from 'react';

import { isKeyboardShortcutMenuOpenedState } from '@/keyboard-shortcut-menu/states/isKeyboardShortcutMenuOpenedState';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useStore } from 'jotai';

export const KEYBOARD_SHORTCUT_MENU_INSTANCE_ID = 'keyboard-shortcut-menu';

export const useKeyboardShortcutMenu = () => {
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const store = useStore();

  const openKeyboardShortcutMenu = useCallback(() => {
    store.set(isKeyboardShortcutMenuOpenedState.atom, true);
    pushFocusItemToFocusStack({
      focusId: KEYBOARD_SHORTCUT_MENU_INSTANCE_ID,
      component: {
        type: FocusComponentType.KEYBOARD_SHORTCUT_MENU,
        instanceId: KEYBOARD_SHORTCUT_MENU_INSTANCE_ID,
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysConflictingWithKeyboard: false,
        enableGlobalHotkeysWithModifiers: false,
      },
    });
  }, [pushFocusItemToFocusStack, store]);

  const closeKeyboardShortcutMenu = useCallback(() => {
    const isKeyboardShortcutMenuOpened = store.get(
      isKeyboardShortcutMenuOpenedState.atom,
    );

    if (isKeyboardShortcutMenuOpened) {
      store.set(isKeyboardShortcutMenuOpenedState.atom, false);
      removeFocusItemFromFocusStackById({
        focusId: KEYBOARD_SHORTCUT_MENU_INSTANCE_ID,
      });
    }
  }, [removeFocusItemFromFocusStackById, store]);

  const toggleKeyboardShortcutMenu = useCallback(() => {
    const isKeyboardShortcutMenuOpened = store.get(
      isKeyboardShortcutMenuOpenedState.atom,
    );

    if (isKeyboardShortcutMenuOpened === false) {
      openKeyboardShortcutMenu();
    } else {
      closeKeyboardShortcutMenu();
    }
  }, [store, closeKeyboardShortcutMenu, openKeyboardShortcutMenu]);

  return {
    toggleKeyboardShortcutMenu,
    openKeyboardShortcutMenu,
    closeKeyboardShortcutMenu,
  };
};

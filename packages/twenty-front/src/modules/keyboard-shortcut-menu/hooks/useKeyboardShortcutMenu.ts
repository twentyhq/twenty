import { useCallback } from 'react';

import { isKeyboardShortcutMenuOpenedStateV2 } from '@/keyboard-shortcut-menu/states/isKeyboardShortcutMenuOpenedStateV2';
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
    store.set(isKeyboardShortcutMenuOpenedStateV2.atom, true);
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
      isKeyboardShortcutMenuOpenedStateV2.atom,
    );

    if (isKeyboardShortcutMenuOpened) {
      store.set(isKeyboardShortcutMenuOpenedStateV2.atom, false);
      removeFocusItemFromFocusStackById({
        focusId: KEYBOARD_SHORTCUT_MENU_INSTANCE_ID,
      });
    }
  }, [removeFocusItemFromFocusStackById, store]);

  const toggleKeyboardShortcutMenu = useCallback(() => {
    const isKeyboardShortcutMenuOpened = store.get(
      isKeyboardShortcutMenuOpenedStateV2.atom,
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

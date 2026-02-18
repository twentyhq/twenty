import { useCallback } from 'react';

import { isKeyboardShortcutMenuOpenedStateV2 } from '@/keyboard-shortcut-menu/states/isKeyboardShortcutMenuOpenedStateV2';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

export const KEYBOARD_SHORTCUT_MENU_INSTANCE_ID = 'keyboard-shortcut-menu';

export const useKeyboardShortcutMenu = () => {
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const openKeyboardShortcutMenu = useCallback(() => {
    jotaiStore.set(isKeyboardShortcutMenuOpenedStateV2.atom, true);
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
  }, [pushFocusItemToFocusStack]);

  const closeKeyboardShortcutMenu = useCallback(() => {
    const isKeyboardShortcutMenuOpened = jotaiStore.get(
      isKeyboardShortcutMenuOpenedStateV2.atom,
    );

    if (isKeyboardShortcutMenuOpened) {
      jotaiStore.set(isKeyboardShortcutMenuOpenedStateV2.atom, false);
      removeFocusItemFromFocusStackById({
        focusId: KEYBOARD_SHORTCUT_MENU_INSTANCE_ID,
      });
    }
  }, [removeFocusItemFromFocusStackById]);

  const toggleKeyboardShortcutMenu = useCallback(() => {
    const isKeyboardShortcutMenuOpened = jotaiStore.get(
      isKeyboardShortcutMenuOpenedStateV2.atom,
    );

    if (isKeyboardShortcutMenuOpened === false) {
      openKeyboardShortcutMenu();
    } else {
      closeKeyboardShortcutMenu();
    }
  }, [closeKeyboardShortcutMenu, openKeyboardShortcutMenu]);

  return {
    toggleKeyboardShortcutMenu,
    openKeyboardShortcutMenu,
    closeKeyboardShortcutMenu,
  };
};

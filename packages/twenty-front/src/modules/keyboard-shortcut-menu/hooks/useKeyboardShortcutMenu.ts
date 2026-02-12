import { useRecoilCallback } from 'recoil';

import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { isKeyboardShortcutMenuOpenedState } from '@/keyboard-shortcut-menu/states/isKeyboardShortcutMenuOpenedState';

export const KEYBOARD_SHORTCUT_MENU_INSTANCE_ID = 'keyboard-shortcut-menu';

export const useKeyboardShortcutMenu = () => {
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const openKeyboardShortcutMenu = useRecoilCallback(
    ({ set }) =>
      () => {
        set(isKeyboardShortcutMenuOpenedState, true);
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
      },
    [pushFocusItemToFocusStack],
  );

  const closeKeyboardShortcutMenu = useRecoilCallback(
    ({ set, snapshot }) =>
      () => {
        const isKeyboardShortcutMenuOpened = snapshot
          .getLoadable(isKeyboardShortcutMenuOpenedState)
          .getValue();

        if (isKeyboardShortcutMenuOpened) {
          set(isKeyboardShortcutMenuOpenedState, false);
          removeFocusItemFromFocusStackById({
            focusId: KEYBOARD_SHORTCUT_MENU_INSTANCE_ID,
          });
        }
      },
    [removeFocusItemFromFocusStackById],
  );

  const toggleKeyboardShortcutMenu = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const isKeyboardShortcutMenuOpened = snapshot
          .getLoadable(isKeyboardShortcutMenuOpenedState)
          .getValue();

        if (isKeyboardShortcutMenuOpened === false) {
          openKeyboardShortcutMenu();
        } else {
          closeKeyboardShortcutMenu();
        }
      },
    [closeKeyboardShortcutMenu, openKeyboardShortcutMenu],
  );

  return {
    toggleKeyboardShortcutMenu,
    openKeyboardShortcutMenu,
    closeKeyboardShortcutMenu,
  };
};

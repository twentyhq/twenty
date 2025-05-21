import { useRecoilCallback } from 'recoil';

import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';

import { isKeyboardShortcutMenuOpenedState } from '../states/isKeyboardShortcutMenuOpenedState';

export const useKeyboardShortcutMenu = () => {
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  const openKeyboardShortcutMenu = useRecoilCallback(
    ({ set }) =>
      () => {
        set(isKeyboardShortcutMenuOpenedState, true);
        setHotkeyScopeAndMemorizePreviousScope({
          scope: AppHotkeyScope.KeyboardShortcutMenu,
        });
      },
    [setHotkeyScopeAndMemorizePreviousScope],
  );

  const closeKeyboardShortcutMenu = useRecoilCallback(
    ({ set, snapshot }) =>
      () => {
        const isKeyboardShortcutMenuOpened = snapshot
          .getLoadable(isKeyboardShortcutMenuOpenedState)
          .getValue();

        if (isKeyboardShortcutMenuOpened) {
          set(isKeyboardShortcutMenuOpenedState, false);
          goBackToPreviousHotkeyScope();
        }
      },
    [goBackToPreviousHotkeyScope],
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

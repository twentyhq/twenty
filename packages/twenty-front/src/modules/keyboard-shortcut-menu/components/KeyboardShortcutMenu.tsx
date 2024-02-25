import { useRecoilValue } from 'recoil';
import { Key } from 'ts-key-enum';

import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { KEYBOARD_SHORTCUTS_GENERAL } from '@/keyboard-shortcut-menu/constants/KeyboardShortcutsGeneral';
import { KEYBOARD_SHORTCUTS_TABLE } from '@/keyboard-shortcut-menu/constants/KeyboardShortcutsTable';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';

import { useKeyboardShortcutMenu } from '../hooks/useKeyboardShortcutMenu';
import { isKeyboardShortcutMenuOpenedState } from '../states/isKeyboardShortcutMenuOpenedState';

import { KeyboardMenuDialog } from './KeyboardShortcutMenuDialog';
import { KeyboardMenuGroup } from './KeyboardShortcutMenuGroup';
import { KeyboardMenuItem } from './KeyboardShortcutMenuItem';

export const KeyboardShortcutMenu = () => {
  const { toggleKeyboardShortcutMenu, closeKeyboardShortcutMenu } =
    useKeyboardShortcutMenu();
  const isKeyboardShortcutMenuOpened = useRecoilValue(
    isKeyboardShortcutMenuOpenedState,
  );
  const { closeCommandMenu } = useCommandMenu();

  useScopedHotkeys(
    'shift+?,meta+?',
    () => {
      closeCommandMenu();
      toggleKeyboardShortcutMenu();
    },
    AppHotkeyScope.KeyboardShortcutMenu,
    [toggleKeyboardShortcutMenu],
  );

  useScopedHotkeys(
    [Key.Escape],
    () => {
      closeKeyboardShortcutMenu();
    },
    AppHotkeyScope.KeyboardShortcutMenuOpen,
    [closeKeyboardShortcutMenu],
  );

  return (
    <>
      {isKeyboardShortcutMenuOpened && (
        <KeyboardMenuDialog onClose={toggleKeyboardShortcutMenu}>
          <KeyboardMenuGroup heading="Table">
            {KEYBOARD_SHORTCUTS_TABLE.map((TableShortcut, index) => (
              <KeyboardMenuItem shortcut={TableShortcut} key={index} />
            ))}
          </KeyboardMenuGroup>
          <KeyboardMenuGroup heading="General">
            {KEYBOARD_SHORTCUTS_GENERAL.map((GeneralShortcut) => (
              <KeyboardMenuItem shortcut={GeneralShortcut} />
            ))}
          </KeyboardMenuGroup>
        </KeyboardMenuDialog>
      )}
    </>
  );
};

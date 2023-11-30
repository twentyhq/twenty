import { useRecoilValue } from 'recoil';

import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';

import {
  keyboardShortcutsGeneral,
  keyboardShortcutsTable,
} from '../constants/keyboardShortcuts';
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
  const isCommandMenuOpened = useRecoilValue(isCommandMenuOpenedState);
  const { closeCommandMenu } = useCommandMenu();
  useScopedHotkeys(
    'shift+?,meta+?',
    () => {
      if (isCommandMenuOpened === true) {
        closeCommandMenu();
      }
      toggleKeyboardShortcutMenu();
    },
    AppHotkeyScope.KeyboardShortcutMenu,
    [toggleKeyboardShortcutMenu],
  );

  useScopedHotkeys(
    'Esc',
    () => {
      closeKeyboardShortcutMenu();
    },
    AppHotkeyScope.KeyboardShortcutMenu,
    [toggleKeyboardShortcutMenu],
  );

  return (
    isKeyboardShortcutMenuOpened && (
      <KeyboardMenuDialog onClose={toggleKeyboardShortcutMenu}>
        <KeyboardMenuGroup heading="Table">
          {keyboardShortcutsTable.map((TableShortcut) => (
            <KeyboardMenuItem shortcut={TableShortcut} />
          ))}
        </KeyboardMenuGroup>
        <KeyboardMenuGroup heading="General">
          {keyboardShortcutsGeneral.map((GeneralShortcut) => (
            <KeyboardMenuItem shortcut={GeneralShortcut} />
          ))}
        </KeyboardMenuGroup>
      </KeyboardMenuDialog>
    )
  );
};

import { KEYBOARD_SHORTCUTS_GENERAL } from '@/keyboard-shortcut-menu/constants/KeyboardShortcutsGeneral';
import { KEYBOARD_SHORTCUTS_SIDE_PANEL } from '@/keyboard-shortcut-menu/constants/KeyboardShortcutsSidePanel';
import { KEYBOARD_SHORTCUTS_TABLE } from '@/keyboard-shortcut-menu/constants/KeyboardShortcutsTable';

import { useKeyboardShortcutMenu } from '@/keyboard-shortcut-menu/hooks/useKeyboardShortcutMenu';
import { isKeyboardShortcutMenuOpenedState } from '@/keyboard-shortcut-menu/states/isKeyboardShortcutMenuOpenedState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { t } from '@lingui/core/macro';
import { KeyboardMenuDialog } from './KeyboardShortcutMenuDialog';
import { KeyboardMenuGroup } from './KeyboardShortcutMenuGroup';
import { KeyboardMenuItem } from './KeyboardShortcutMenuItem';

export const KeyboardShortcutMenuOpenContent = () => {
  const { closeKeyboardShortcutMenu } = useKeyboardShortcutMenu();
  const isKeyboardShortcutMenuOpened = useAtomStateValue(
    isKeyboardShortcutMenuOpenedState,
  );

  return (
    <>
      <KeyboardMenuDialog
        open={isKeyboardShortcutMenuOpened}
        onClose={closeKeyboardShortcutMenu}
      >
        <KeyboardMenuGroup heading={t`Table`}>
          {KEYBOARD_SHORTCUTS_TABLE.map((TableShortcut, index) => (
            <KeyboardMenuItem shortcut={TableShortcut} key={index} />
          ))}
        </KeyboardMenuGroup>
        <KeyboardMenuGroup heading={t`Side Panel`}>
          {KEYBOARD_SHORTCUTS_SIDE_PANEL.map((SidePanelShortcut, index) => (
            <KeyboardMenuItem shortcut={SidePanelShortcut} key={index} />
          ))}
        </KeyboardMenuGroup>
        <KeyboardMenuGroup heading={t`General`}>
          {KEYBOARD_SHORTCUTS_GENERAL.map((GeneralShortcut, index) => (
            <KeyboardMenuItem shortcut={GeneralShortcut} key={index} />
          ))}
        </KeyboardMenuGroup>
      </KeyboardMenuDialog>
    </>
  );
};

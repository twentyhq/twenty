import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';

import { useKeyboardShortcutMenu } from '@/keyboard-shortcut-menu/hooks/useKeyboardShortcutMenu';
import { isKeyboardShortcutMenuOpenedStateV2 } from '@/keyboard-shortcut-menu/states/isKeyboardShortcutMenuOpenedStateV2';

import { KeyboardShortcutMenuOpenContent } from '@/keyboard-shortcut-menu/components/KeyboardShortcutMenuOpenContent';
import { useGlobalHotkeys } from '@/ui/utilities/hotkey/hooks/useGlobalHotkeys';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const KeyboardShortcutMenu = () => {
  const { toggleKeyboardShortcutMenu } = useKeyboardShortcutMenu();
  const isKeyboardShortcutMenuOpened = useAtomStateValue(
    isKeyboardShortcutMenuOpenedStateV2,
  );
  const { closeCommandMenu } = useCommandMenu();

  useGlobalHotkeys({
    keys: ['shift+?', 'meta+?'],
    callback: () => {
      closeCommandMenu();
      toggleKeyboardShortcutMenu();
    },
    containsModifier: false,
    dependencies: [toggleKeyboardShortcutMenu],
  });

  return (
    <>{isKeyboardShortcutMenuOpened && <KeyboardShortcutMenuOpenContent />}</>
  );
};

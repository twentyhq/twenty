import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';

import { useKeyboardShortcutMenu } from '@/keyboard-shortcut-menu/hooks/useKeyboardShortcutMenu';
import { isKeyboardShortcutMenuOpenedStateV2 } from '@/keyboard-shortcut-menu/states/isKeyboardShortcutMenuOpenedStateV2';

import { KeyboardShortcutMenuOpenContent } from '@/keyboard-shortcut-menu/components/KeyboardShortcutMenuOpenContent';
import { useGlobalHotkeys } from '@/ui/utilities/hotkey/hooks/useGlobalHotkeys';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';

export const KeyboardShortcutMenu = () => {
  const { toggleKeyboardShortcutMenu } = useKeyboardShortcutMenu();
  const isKeyboardShortcutMenuOpened = useRecoilValueV2(
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
